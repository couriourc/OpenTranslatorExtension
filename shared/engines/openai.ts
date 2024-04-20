import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";
import {getSettings} from "@/shared/config.ts";


export class OpenAIEngine extends AbstractOpenAI {
    name = "openai";


    async getAPIKey(): Promise<string> {
        const {openAiKey} = await getSettings();
        return Promise.resolve(openAiKey);
    }

    async getAPIModel(): Promise<string> {
        const {openAiModel} = await getSettings();
        return Promise.resolve(openAiModel);
    }

    async getAPIURL(): Promise<string> {
        const {openAiUrl} = await getSettings();
        return Promise.resolve(openAiUrl);
    }

    public getAPIURLPath(): Promise<string> {
        return Promise.resolve("/v1/chat/completions");
    }

}
