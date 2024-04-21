import {MessagePool, WrapperHelper} from "@/shared/design-pattern/Singleton.ts";
import {browser} from "wxt/browser";
import {z} from "zod";

export const ALL_DOM_EVENTS = {
    "show-popup": (...args: any[]) => new CustomEvent("show-popup", ...args),
    "hide-popup": (...args: any[]) => new CustomEvent("hide-popup", ...args),
};


export interface IWrapJqueryEventObj {
    unlisten(): any;
}

export function wrap_jquery_event(event_name: keyof typeof ALL_DOM_EVENTS, fn: Function) {
    let is_unlistened = false;
    let obj: IWrapJqueryEventObj = {
        unlisten: () => {
            is_unlistened = true;
        }
    };
    WrapperHelper
        .then(({$ui, dom}) => {
            if (is_unlistened) return;
            /*@ts-ignore*/
            const listen = (event: Event) => fn(event.detail!);
            /*@ts-ignore*/
            dom.addEventListener(event_name, listen);
            obj.unlisten = () => {
                /*@ts-ignore*/
                dom.removeEventListener(event_name, listen);
                is_unlistened = true;
            };
        });

    return obj;
}

export function trigger_wrapper_jquery_event(event_name: keyof typeof ALL_DOM_EVENTS, args?: any) {
    WrapperHelper
        .then(({$ui, dom}) => {
            dom.dispatchEvent(ALL_DOM_EVENTS[event_name]({
                detail: args
            }));
        });
}

/*在 background 中能执行的命令*/
const TBackgroundCommands = z.enum(["open-option", 'abort', "openai"] as const);
export type TBackgroundCommands = z.infer<typeof TBackgroundCommands>;
/*在 content scripts 中能执行的命令*/
const TContentScriptCommand = z.enum(["open-sidebar", "open-popup"] as const);
export type TContentScriptCommand = z.infer<typeof TContentScriptCommand>;
/*整个系统通用的指令*/
export type TSysCommand = 'abort';
export type TAllCommandType = "open-option"
    | "open-setting"
    | "open-translator"
    | TBackgroundCommands
    | TContentScriptCommand
    | TSysCommand;

export interface IAllCHANELEventMessage<CommandType extends TAllCommandType> {
    type: CommandType;

    [k: string]: any;
}


export const make_chanel_message = (type: TAllCommandType) => (...args: any[]) => (({
    type: type,
    ...args
}) as IAllCHANELEventMessage<TAllCommandType>);

export function trigger_channel_event(event_name: TAllCommandType, args?: any) {
    MessagePool.then((connector) => {
        console.log(connector);
        connector.postMessage(make_chanel_message(event_name)(args));
    });
}


export async function executeCommand(command: TAllCommandType) {
    switch (command) {
        case 'open-setting':
        // Fall through
        case 'open-option':
            await browser.windows.create({
                type: 'popup',
                url: browser.runtime.getURL("/options.html"),
            });
            break;
        case "open-sidebar":
            await browser.sidebarAction.open();
            break;
        case 'open-popup':
            break;
    }

}

export async function executeBackgroundCommand(command: TBackgroundCommands) {
    return executeCommand(command as TAllCommandType);
}

export async function executeContentScriptsCommand(command: TContentScriptCommand) {
    return executeCommand(command as TAllCommandType);
}

export function listen_all_content_scripts_command() {
    browser.runtime.onMessage.addListener(async (command: IAllCHANELEventMessage<TContentScriptCommand>) => {
        console.log(TContentScriptCommand.parse(command.type));
        if (TContentScriptCommand.parse(command.type))
            await executeContentScriptsCommand(command.type);
    });
}

export function listen_all_background_command() {
    browser.runtime.onMessage.addListener(async (command: IAllCHANELEventMessage<TBackgroundCommands>, sender,) => {
        console.log(sender);
        if (TBackgroundCommands.parse(command.type))
            await executeBackgroundCommand(command.type);
    });

}
