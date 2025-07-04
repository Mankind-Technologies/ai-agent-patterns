/**
 * Configuration for Embedded Explaining Pattern
 * 
 * Simple configuration for explanation requirements when tools are invoked.
 */

export interface ExplainingConfig {
    // Explanation requirements
    requireExplanations: boolean;
    explanationMinLength: number;
    explanationMaxLength: number;
    explanationPrompt: string;
    
    // Logging settings
    enableLogging: boolean;
    logLevel: 'minimal' | 'detailed' | 'verbose';
}

export const defaultConfig: ExplainingConfig = {
    // Explanation requirements
    requireExplanations: true,
    explanationMinLength: 10,
    explanationMaxLength: 500,
    explanationPrompt: "Explain why this action is justified and what goal it serves",
    
    // Logging settings
    enableLogging: true,
    logLevel: 'detailed'
};

export class ConfigManager {
    private config: ExplainingConfig;
    
    constructor(customConfig?: Partial<ExplainingConfig>) {
        this.config = { ...defaultConfig, ...customConfig };
        this.validateConfig();
    }
    
    private validateConfig(): void {
        if (this.config.explanationMinLength < 0) {
            throw new Error('Explanation minimum length cannot be negative');
        }
        
        if (this.config.explanationMaxLength < this.config.explanationMinLength) {
            throw new Error('Explanation maximum length must be greater than minimum length');
        }
    }
    
    get<K extends keyof ExplainingConfig>(key: K): ExplainingConfig[K] {
        return this.config[key];
    }
    
    set<K extends keyof ExplainingConfig>(key: K, value: ExplainingConfig[K]): void {
        this.config[key] = value;
        this.validateConfig();
    }
    
    getAll(): ExplainingConfig {
        return { ...this.config };
    }
    
    update(updates: Partial<ExplainingConfig>): void {
        this.config = { ...this.config, ...updates };
        this.validateConfig();
    }
    
    reset(): void {
        this.config = { ...defaultConfig };
        this.validateConfig();
    }
    
    getExplanationOptions() {
        return {
            requireExplanation: this.config.requireExplanations,
            explanationPrompt: this.generateExplanationPrompt(),
            includeReasoningInOutput: false
        };
    }
    
    private generateExplanationPrompt(): string {
        const minLength = this.config.explanationMinLength;
        const maxLength = this.config.explanationMaxLength;
        
        let prompt = this.config.explanationPrompt;
        
        if (minLength > 0 || maxLength < 500) {
            prompt += ` (${minLength}-${maxLength} characters)`;
        }
        
        return prompt;
    }
    
    getSummary(): string {
        return `
🔧 Configuration Summary:
- Explanations required: ${this.config.requireExplanations ? '✅' : '❌'}
- Explanation length: ${this.config.explanationMinLength}-${this.config.explanationMaxLength} chars
- Logging level: ${this.config.logLevel}`;
    }
}

// Export singleton instance
export const config = new ConfigManager();

// Export common configurations
export const strictConfig = new ConfigManager({
    requireExplanations: true,
    explanationMinLength: 20,
    explanationMaxLength: 200,
    logLevel: 'verbose'
});

export const relaxedConfig = new ConfigManager({
    requireExplanations: false,
    explanationMinLength: 0,
    explanationMaxLength: 1000,
    logLevel: 'minimal'
}); 