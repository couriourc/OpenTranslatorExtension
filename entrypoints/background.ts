import {browser} from "wxt/browser";
import {
    executeCommand,
    IAllCHANELEventMessage,
    listen_all_background_command,
    make_chanel_message,
} from "@/shared/events";
import {GPTEngine, MessagePool} from "@/shared/design-pattern/Singleton.ts";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {portName} from "@/shared/constants";
import {$t} from "@/shared/utils.ts";
import {IMessageChannel, useBackgroundServiceConnector} from "@/shared/hooks/useConnector.ts";
import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";
import {TAllCommandType, TBackgroundCommands} from "@/shared/enums";

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

    browser.runtime.onConnect.addListener((connector,) => {
        if (connector.name !== portName) return;
        console.assert(connector.name === portName);
        MessagePool.set(connector);

    });

    browser.runtime.onInstalled.addListener(({reason}) => {
        if (reason === "install") {
            storage.setItem("local:installData", Date.now());
        }
    });
    // 替换使用 openai
    replaceGPTEngine(new OpenAIEngine());
    // 将数据先集中处理，后续可以分布式
    useBackgroundServiceConnector("db").then(handleDBQuery);
    useBackgroundServiceConnector("openai").then(handleOpenAiQuery);
    useBackgroundServiceConnector(portName).then(handlePortName);


    listen_all_background_command();
});

function handleDBQuery(channel: IMessageChannel) {
    channel.on_message((...args: any[]) => {
        console.log(...args);
    });
}

function handleOpenAiQuery(channel: IMessageChannel) {
    channel.on_message((...args: any[]) => {
        console.log(...args);
    });
}

async function handlePortName(channel: IMessageChannel) {
    const sys_commands = await browser.commands.getAll();
    const self_command = ["open-setting", "open-sidebar"];/*用于自定义命令*/
    const controller = new AbortController();

    let commands = new Set<string>(
        (sys_commands
            ?.filter(command => !!command.name)
            ?.map((item) => {
                return item.name as string;
            }) ?? []).concat(
            self_command
        )
    );
    channel.on_message(async (message: IAllCHANELEventMessage<TBackgroundCommands>) => {
        if (commands.has(message.type)) {
            return executeCommand(message.type as TAllCommandType);
        }
        switch (message.type) {
            case 'abort':
                controller.abort();
                break;
            case 'openai':
//                await sendOpenAiWithStream(message, controller.signal);
                break;
        }
    });
}

function replaceGPTEngine(engine: AbstractOpenAI) {
    GPTEngine.replace(engine);
}
