import fetch from "node-fetch";

interface ModelConfig {
  id: string;
  role: string;
  cost_weight: number;
  timeout: number;
}

interface ModelRegistry {
  [key: string]: ModelConfig;
}

interface ModelResponse {
  content: string;
  model: string;
  role: string;
  error?: string;
}

interface OrchestrationResult {
  content: string;
  mode: string;
  consensus: boolean;
  models_used: string[];
  metadata: any;
  error?: string;
}

export class SmartMultiModelOrchestrator {
  private apiKey: string;
  private apiUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();

  private readonly MODELS: ModelRegistry = {
    "llama": {
      id: "meta-llama/llama-3-8b-instruct",
      role: "general",
      cost_weight: 1.0,
      timeout: 30
    },
    "deepseek": {
      id: "deepseek/deepseek-chat",
      role: "reasoning", 
      cost_weight: 1.2,
      timeout: 35
    },
    "mistral": {
      id: "mistralai/mistral-7b-instruct",
      role: "analysis",
      cost_weight: 1.0,
      timeout: 25
    },
    "qwen": {
      id: "qwen/qwen-2.5-14b-instruct",
      role: "validation",
      cost_weight: 1.5,
      timeout: 30
    },
    "gpt": {
      id: "openai/gpt-3.5-turbo",
      role: "creativity",
      cost_weight: 1.8,
      timeout: 30
    },
    "gemma": {
      id: "google/gemma-7b-it",
      role: "logic",
      cost_weight: 1.0,
      timeout: 25
    }
  };

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async execute_mode(mode: string, messages: any[], temperature: number = 0.3): Promise<OrchestrationResult> {
    const cacheKey = this.generateCacheKey(messages, mode);
    
    // Check cache
    if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return { ...cached, from_cache: true };
    }

    try {
      let result: OrchestrationResult;

      switch (mode) {
        case "smart_consensus":
          result = await this.smartConsensus(messages, temperature);
          break;
        case "validated":
          result = await this.validatedMode(messages, temperature);
          break;
        default:
          result = await this.smartConsensus(messages, temperature);
      }

      // Cache result
      this.cache.set(cacheKey, result);
      this.cacheTimestamps.set(cacheKey, Date.now());

      return result;
    } catch (error) {
      console.error("AI orchestration error:", error);
      return {
        content: "I apologize, but I'm experiencing technical difficulties. Please try again.",
        mode,
        consensus: false,
        models_used: [],
        metadata: { error: true },
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private async smartConsensus(messages: any[], temperature: number): Promise<OrchestrationResult> {
    const selectedModels = ["llama", "deepseek", "mistral"];
    const responses: ModelResponse[] = [];

    // Execute in parallel with timeout handling
    const promises = selectedModels.map(modelKey => 
      this.callModel(this.MODELS[modelKey], messages, temperature)
        .catch(error => ({
          content: "",
          model: this.MODELS[modelKey].id,
          role: this.MODELS[modelKey].role,
          error: error.message
        }))
    );

    const results = await Promise.all(promises);
    
    // Filter successful responses
    for (const result of results) {
      if (!result.error && result.content) {
        responses.push(result);
      }
    }

    if (responses.length === 0) {
      throw new Error("All models failed to respond");
    }

    // Select best response (preferring reasoning models for complex queries)
    const bestResponse = this.selectBestResponse(responses);
    
    return {
      content: bestResponse.content,
      mode: "smart_consensus",
      consensus: responses.length >= 2,
      models_used: responses.map(r => r.model),
      metadata: {
        total_responses: responses.length,
        selected_model: bestResponse.model,
        consensus_score: responses.length / selectedModels.length
      }
    };
  }

  private async validatedMode(messages: any[], temperature: number): Promise<OrchestrationResult> {
    const primaryModel = this.MODELS["deepseek"];
    const validatorModel = this.MODELS["qwen"];

    // Get primary response
    const primaryResponse = await this.callModel(primaryModel, messages, temperature);
    
    // Validate response
    const validationMessages = [
      ...messages,
      { role: "assistant", content: primaryResponse.content },
      { 
        role: "user", 
        content: "Review the above response for accuracy and safety. Respond with JSON: {\"approved\": true/false, \"confidence\": 0.0-1.0, \"issues\": \"any concerns\"}" 
      }
    ];

    try {
      const validationResponse = await this.callModel(validatorModel, validationMessages, 0.1);
      const validation = JSON.parse(validationResponse.content);
      
      return {
        content: primaryResponse.content,
        mode: "validated",
        consensus: validation.approved && validation.confidence > 0.6,
        models_used: [primaryModel.id, validatorModel.id],
        metadata: {
          validation,
          approved: validation.approved,
          confidence: validation.confidence
        }
      };
    } catch (validationError) {
      return {
        content: primaryResponse.content,
        mode: "validated",
        consensus: false,
        models_used: [primaryModel.id],
        metadata: { validation_failed: true }
      };
    }
  }

  private async callModel(model: ModelConfig, messages: any[], temperature: number): Promise<ModelResponse> {
    const payload = {
      model: model.id,
      messages,
      temperature
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid response from API");
    }

    return {
      content: data.choices[0].message.content,
      model: model.id,
      role: model.role
    };
  }

  private selectBestResponse(responses: ModelResponse[]): ModelResponse {
    if (responses.length === 1) return responses[0];

    // Prefer reasoning and analysis models for complex queries
    const priorityRoles = ["reasoning", "analysis", "validation", "general"];
    
    for (const role of priorityRoles) {
      const roleResponse = responses.find(r => r.role === role);
      if (roleResponse) return roleResponse;
    }

    // Fallback to first response
    return responses[0];
  }

  private generateCacheKey(messages: any[], mode: string): string {
    const content = JSON.stringify(messages) + mode;
    return Buffer.from(content).toString('base64').slice(0, 32);
  }

  private isCacheValid(cacheKey: string, ttlMinutes: number = 10): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    return (Date.now() - timestamp) < (ttlMinutes * 60 * 1000);
  }
}
