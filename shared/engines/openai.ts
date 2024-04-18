import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";


export class OpenAIEngine extends AbstractOpenAI {
    openApiKey = "";

    async getAPIKey(): Promise<string> {
        const {apiKey} = await browser.storage.local.get(["apiKey"]);
        console.log(apiKey);
        return Promise.resolve(apiKey);
    }

    public getAPIModel(): Promise<string> {
        return Promise.resolve("gpt-3.5-turbo");
    }

    public getAPIURL(): Promise<string> {
        return Promise.resolve("http://localhost:1337");
    }

    public getAPIURLPath(): Promise<string> {
        return Promise.resolve("/v1/chat/completions");
    }

}
