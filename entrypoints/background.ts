import {browser} from "wxt/browser";
import {
    executeCommand,
    IAllCHANELEventMessage,
    listen_all_background_command,
    make_chanel_message,
    TAllCommandType,
    TBackgroundCommands
} from "@/shared/events";
import {GPTEngine, MessagePool} from "@/shared/design-pattern/Singleton.ts";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {portName} from "@/shared/constants";
import {$t} from "@/shared/utils.ts";

type Port = ReturnType<typeof browser.runtime.connect>

async function sendOpenAiWithStream(connector: Port, message: Record<string, string>, signal: AbortSignal) {
    const gpt = GPTEngine.get()!;
    console.assert(gpt !== null, "不存在gpt引擎信息");
    await gpt.sendMessage({
        assistantPrompts: [],
        commandPrompt: message['selection'],
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
        rolePrompt: `You are a excellent translator,and you need translate to ${message['to']}`,
        signal: signal,
    });
}


export default defineBackground(async () => {
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
        await browser.tabs.sendMessage(tab.id, make_chanel_message("open-sidebar")(info));
    });
    /*@ts-ignore*/
    browser.commands.onCommand.addListener(async (command: string, tabs) => {
        await executeCommand(command as TAllCommandType);
    });

    if (GPTEngine.is_loaded()) return;
    const openai = new OpenAIEngine();
    GPTEngine.set(openai);
    const sys_commands = await browser.commands.getAll();
    let commands = new Set<string>(
        (sys_commands
            ?.filter(command => !!command.name)
            ?.map((item) => {
                return item.name as string;
            }) ?? []).concat(
            /*用于自定义命令*/
            "open-setting",
            "open-sidebar"
        )
    );
    browser.runtime.onConnect.addListener((connector,) => {
        if (connector.name !== portName) return;
        const controller = new AbortController();
        console.assert(connector.name === portName);
        MessagePool.set(connector);

        connector.onMessage.addListener(async (message: IAllCHANELEventMessage<TBackgroundCommands>, port) => {
            if (commands.has(message.type)) {
                return executeCommand(message.type as TAllCommandType);
            }
            switch (message.type) {
                case 'abort':
                    controller.abort();
                    break;
                case 'openai':
                    await sendOpenAiWithStream(port, message, controller.signal);
                    break;
            }
        });
    });

    browser.runtime.onInstalled.addListener(({reason}) => {
        if (reason === "install") {
            storage.setItem("local:installData", Date.now());
        }
    });
    listen_all_background_command();
});
