import {MessagePool, WrapperHelper} from "@/shared/design-pattern/Singleton.ts";

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

export type TAllCommandType = "open-option"
    | "open-popup"
    | "open-setting"
    | "open-translator";

export interface IAllCHANELEventMessage {
    type: string;

    [k: string]: any;
}

export const make_chanel_message = (type: TAllCommandType) => (...args: any[]) => (({
    type: type,
    ...args
}) as IAllCHANELEventMessage);

export function trigger_channel_event(event_name: TAllCommandType, args?: any) {
    MessagePool.then((connector) => {
        console.log(connector);
        connector.postMessage(make_chanel_message(event_name)(args));
    });
}

