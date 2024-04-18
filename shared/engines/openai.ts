import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";


export class OpenAIEngine extends AbstractOpenAI {
    openApiKey = "";

    public getAPIKey(): Promise<string> {
        return Promise.resolve("app-Ztr6OezxTKFFO3a6MAaHRRv2");
    }

    public getAPIModel(): Promise<string> {
        return Promise.resolve("");
    }

    public getAPIURL(): Promise<string> {
        return Promise.resolve("https://api.dify.ai/v1");
    }

    public getAPIURLPath(): Promise<string> {
        return Promise.resolve("");
    }

}
