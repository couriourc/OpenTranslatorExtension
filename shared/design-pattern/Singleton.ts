import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";
import {Singleton} from "@couriourc/design-patterns";

export {Singleton} from "@couriourc/design-patterns";

export const GPTEngine = new Singleton<AbstractOpenAI>();

export const WrapperHelper = new Singleton<{
    $ui: JQuery,
    dom: HTMLElement
}>();

export const MessagePool = new Singleton<ReturnType<typeof browser.runtime.connect>>();
