import {browser} from "wxt/browser";
import {Singleton} from "@/shared/design-pattern/Singleton.ts";
import {useState} from "react";
import mitt from 'mitt';

type Port = ReturnType<typeof browser.runtime.connect>;

export interface IMessageChannel {
    on_message: any;
    send_message: any;
    off_message: any;
    disconnect: any;
}

const cachedMap = new Map<string, Singleton<IMessageChannel>>();
const connecting_message = (connector: string) => `@${connector}-connecting`;
const connected_message = (connector: string) => `@${connector}-connected`;
const received_message = (connector: string) => `@${connector}-received`;
const sending_message = (connector: string) => `@${connector}-sending`;
const send_finish_message = (connector: string, hashcode: ReturnType<typeof convertToHash>) => `@${connector}${hashcode}-send_finish`;

function convertToHash(str: any) {
    str = JSON.stringify(str);
    if (str === "") return 0;
    let hashString = 0;
    for (let character of str) {
        let charCode = character.charCodeAt(0);
        hashString = hashString << 5 - hashString;
        hashString += charCode;
        hashString |= hashString;
    }
    return hashString;
}

//@ts-ignore
const event = new mitt<Record<string, {
    on_message: any;
    send_message: any;
    off_message: any;
    disconnect: any;
}>>();

export const useBrowserConnector = (() => {
    return (connector: string) => {
        const _cached = cachedMap.get(connector);
        if (_cached) {
            return _cached;
        }
        const browserConnector = new Singleton<{
            on_message: any;
            send_message: any;
            off_message: any;
            disconnect: any;
        }>();
        cachedMap.set(connector, browserConnector);
        const port = browser.runtime.connect({name: connector});

        function on_message(fn: Function) {
            event.on(received_message(connector), fn);
        }

        function off_message(key: any) {
            event.off(key);
        }

        function disconnect() {

        }

        function send_message(message: any) {
            return new Promise((resolve, reject) => {
                event.emit(sending_message(connector), message);
                const port = browserConnector.get();
                port.on_message((message: any) => {
                    if (message.type === send_finish_message(connector, convertToHash(message))) {
                        port.off_message(message.type);
                        resolve(message.info);
                    }
                });
            });
        }

        event.on(sending_message(port.name), (info: any) => {
            browserConnector.then(() => {
                port.postMessage({
                    type: sending_message(port.name),
                    info
                });
            });
        });
        event.on(connecting_message(connector), () => {
            console.log("connected");
        });
        port.onMessage.addListener((message, port) => {
            switch (message.type) {
                case connected_message(connector):
                    // 完成链接
                    browserConnector.set({
                        send_message,
                        off_message,
                        on_message,
                        disconnect,
                    });
                    event.emit(connecting_message(connector));
                    break;

                case sending_message(connector):
                    event.emit(
                        received_message(connector), {
                            message: message,
                            sender(info: any) {
                                port.postMessage({
                                    type: send_finish_message(connector, convertToHash(JSON.stringify(message))),
                                    info,
                                });
                            }
                        });
                    break;

            }
        });

        return browserConnector;
    };

})();

export const useBackgroundServiceConnector = (() => {

    browser.runtime.onConnect.addListener((connector) => {
        event.emit(connecting_message(connector.name), connector);
    });


    return (connector: string) => {
        let _cached = cachedMap.get(connector);
        if (_cached) {
            return _cached;
        }
        const loaded = new Set();
        const backgroundServiceConnector = new Singleton<{
            on_message: any;
            send_message: any;
            off_message: any;
            disconnect: any;
        }>();

        function on_message(fn: Function) {
            event.on(received_message(connector), fn);
        }

        function off_message(key: string) {
            event.off(key);
        }

        function send_message(message: any) {
            return new Promise((resolve, reject) => {
                event.emit(sending_message(connector), message);
                const port = backgroundServiceConnector.get();
                port.on_message((message: any) => {
                    if (message.type === send_finish_message(connector, convertToHash(message))) {
                        port.off_message(message.type);
                        resolve(message.info);
                    }
                });
            });
        }

        function disconnect() {

        }

        event.on(connecting_message(connector), (port: Port) => {

            port.postMessage({type: connected_message(connector)});
            port.onMessage.addListener((message, port) => {
                event.emit(received_message(port.name), message);
            });
            event.on(sending_message(port.name), (info: any) => {
                port.postMessage({
                    type: sending_message(port.name),
                    info
                });
            });
            backgroundServiceConnector.set({
                on_message,
                send_message,
                disconnect,
                off_message,
            });
            event.off(connecting_message(connector));
        });


        return backgroundServiceConnector;
    };
})();
