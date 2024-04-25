import {browser} from "wxt/browser";
import {Singleton} from "@/shared/design-pattern/Singleton.ts";
import {useState} from "react";
import mitt from 'mitt';
import {noop} from "underscore";

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
const heat_beat = (connector: string) => `@${connector}-ping`;

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
        if (_cached) return _cached;

        const browserConnector = new Singleton<{
            on_message: any;
            send_message: any;
            off_message: any;
            disconnect: any;
        }>();
        // 绑定初始化
        cachedMap.set(connector, browserConnector);
        // 尝试链接上后台
        const port = browser.runtime.connect({name: connector});

        // 获取消息
        function on_message(fn: Function) {
            event.on(received_message(connector), fn);
        }

        //
        function off_message(key: any) {
            event.off(key);
        }

        function disconnect() {

        }

        function send_message(message: any) {
            let _unlistened = false;
            let unlisten = () => {
                _unlistened = true;
                executor.cancel = noop;
                unlisten = noop;
            };
            const promisify = new Promise((resolve, reject) => {

                event.emit(sending_message(connector), message);
                const port = browserConnector.get();
                port.on_message((message: any) => {
                    if (message.type === send_finish_message(connector, convertToHash(message))) {
                        if (_unlistened) unlisten();
                        port.off_message(message.type);
                        executor.cancel();
                        resolve(message.info);
                    }
                });


            });
            const executor = {
                then: promisify.then,
                catch: promisify.catch,
                finally: promisify.finally,
                cancel: unlisten,
            };
            return executor;
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
        // 监听来自后台的消息
        port.onMessage.addListener((message, port) => {
            console.log(message);
            switch (message.type) {
                // 完成链接
                case connected_message(connector):
                    // 初始化链接
                    browserConnector.set({
                        send_message,
                        off_message,
                        on_message,
                        disconnect,
                    });
                    // 通知当前连接的对象
                    event.emit(connecting_message(connector));
                    break;
                //
                case sending_message(connector):
                    event.emit(
                        // 接收到消息,通知监听消息的组件
                        received_message(connector), {
                            info: message.info,
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
                backgroundServiceConnector.then((port) => {
                    event.emit(sending_message(connector), message);
                    port.on_message((message: any) => {
                        // 验证正确消息
                        if (message.type === send_finish_message(connector, convertToHash(message))) {
                            port.off_message(message.type);
                            resolve(message.info);
                        }
                    });
                });
            });
        }

        function disconnect() {

        }

        // 接收消息
        event.on(connecting_message(connector),
            (port: Port) => {
                // 确认连接接成功
                port.postMessage({type: connected_message(connector)});
                // 开始监听消息
                port.onMessage.addListener((message, port) => {
                    event.emit(received_message(port.name), message);
                });
                event.on(
                    // 监听从后台发送消息的任务，用于提供消息发送
                    sending_message(port.name),
                    (info: any) => {
                        // 执行消息发送
                        port.postMessage({
                            type: sending_message(port.name),
                            info
                        });
                    });
                // 完成消息初始化
                backgroundServiceConnector.set({
                    on_message,
                    send_message,
                    disconnect,
                    off_message,
                });
                // 消息链接完成，不再监听消息监听这个事儿，句柄交给后面的发送消息，这个限制了只能有一种类型的链接
                // 心跳~似乎暂时不需要

            });


        return backgroundServiceConnector;
    };
})();
