export interface IAIService {
    chat(message: string, onChunk?: (chunk: string) => void): Promise<string>;
    chatStream(message: string): AsyncGenerator<string>;
    isConfigured(): boolean;
}
//# sourceMappingURL=IAIService.d.ts.map