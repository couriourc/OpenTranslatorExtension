import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";


export class OpenAIEngine extends AbstractOpenAI {
    name = "openai";


    async getAPIKey(): Promise<string> {
        const {openAiKey} = await browser.storage.local.get(["openAiKey"]);
        return Promise.resolve(openAiKey);
    }

    public getAPIModel(): Promise<string> {
        return Promise.resolve("gpt-3.5-turbo");
    }

    async getAPIURL(): Promise<string> {
        const {openAiUrl} = await browser.storage.local.get(["openAiUrl"]);

        return Promise.resolve(openAiUrl);
    }

    public getAPIURLPath(): Promise<string> {
        return Promise.resolve("/v1/chat/completions");
    }

}
