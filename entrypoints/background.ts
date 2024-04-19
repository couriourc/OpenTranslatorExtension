import {browser} from "wxt/browser";
import {ALL_TAB_EVENS} from "@/shared/events";
import {GPTEngine} from "@/shared/design-pattern/Singleton.ts";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {portName} from "@/shared/constants";
import {$t} from "@/shared/utils.ts";

type Port = ReturnType<typeof browser.runtime.connect>

async function sendOpenAiWithStream(connector: Port, message: string, signal: AbortSignal) {
    GPTEngine.then((gpt) => {
        gpt.sendMessage({
            assistantPrompts: [],
            commandPrompt: "",
            onError(error: string): void {
            },
            onFinished(reason: string): void {
            },
            async onMessage(message: {
                content: string;
                role: string;
                isFullText?: boolean
            }): Promise<void> {
                connector.postMessage(message);
            },
            rolePrompt: message,
            signal: signal,
        });

    });
}

export default defineBackground(() => {
    // Setup context
    browser.contextMenus?.create({
        id: browser.runtime.id,
        type: 'normal',
        title: $t("extName"),
        contexts: ['page', 'selection'],
    }, () => {
        browser.runtime.lastError;
    });

    browser.contextMenus?.onClicked.addListener(async function (info) {
        const [tab] = await browser.tabs.query({active: true, lastFocusedWindow: true});
        tab.id &&
        await browser.tabs.sendMessage(tab.id, ALL_TAB_EVENS["open-translator"](info));
    });

    browser.commands.onCommand.addListener(async (command) => {
        switch (command) {
            case 'open-option':
                await browser.windows.create({
                    type: 'popup',
                    url: browser.runtime.getURL("/options.html"),
                });
                break;
            case 'open-popup':
                break;
        }
    });


    browser.runtime.onInstalled.addListener(({reason}) => {
        if (reason === "install") {
            browser.storage.local.set({installData: Date.now()});
        }
    });

    if (GPTEngine._is_loaded()) return;
    const openai = new OpenAIEngine();
    GPTEngine.set(openai);

    browser.runtime.onConnect.addListener((connector,) => {
        if (connector.name !== portName) return;
        const controller = new AbortController();
        console.assert(connector.name === portName);
        connector.onMessage.addListener(async (message, ...params) => {
            switch (message.action) {
                case 'abort':
                    controller.abort();
                    break;
                case 'open':
                    await sendOpenAiWithStream(connector, message.detail, controller.signal);
                    break;
            }
        });
    });

});
