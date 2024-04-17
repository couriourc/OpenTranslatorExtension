import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";


export class OpenAIEngine extends AbstractOpenAI {
    openApiKey = "";

    public getAPIKey(): Promise<string> {
        return Promise.resolve("");
    }

    public getAPIModel(): Promise<string> {
        return Promise.resolve("");
    }

    public getAPIURL(): Promise<string> {
        return Promise.resolve("");
    }

    public getAPIURLPath(): Promise<string> {
        return Promise.resolve("");
    }

}
