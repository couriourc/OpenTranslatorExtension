import Dexie, {Table} from "dexie";
import pkg from "@/package.json";
import {isUndefined, noop} from "underscore";

/**用于单词本信息记录
 * @Constructor {string} sysName 为了方便抽离使用
 * */
export abstract class DB extends Dexie {
    /**
     * @public 系统信息
     * */
    system!: Table<{
        version: number,
        id?: number
    }>;
    wordbook!: Table<{
        id?: number,
        book_name: string,
    }>;

    constructor(sysName: string) {
        super(sysName);

    }


    _loaded: boolean = false;
    _used_bypass?: boolean = undefined;
    #connector?: ReturnType<typeof browser.runtime.connect>;
    #on_message?: (fn: Function) => void = noop;
    #off_message?: (fn: Function) => void = noop;
    #send_message?: (fn: Function) => void = noop;
    _used_bypass_connecting: boolean = false;

    error(reason: string) {
        console.error(reason);
    }

    use_bypass() {
//        this._loaded = true;
        this._used_bypass = true;
        if (this._used_bypass_connecting) {
            return;
        }
        this._used_bypass_connecting = true;
        let _connected = browser.runtime.connect(browser.runtime.id, {
            name: 'db'
        });
        const _cached = new Set<Function>();
        let run_message = (message: any) => {
            _cached.forEach((fn) => {
                fn(message);
            });
        };
        this.#on_message = (fn: Function) => {
            _cached.add(fn);
        };
        this.#off_message = (fn: Function) => {
            _cached.delete(fn);
        };
        this.#send_message = (message: any) => {
            _connected.postMessage(message);
        };
        _connected.onMessage.addListener((message) => {
            if (message.type === "connected") {
                /*完成初始化链接*/
                this.#connector = _connected;
                this._used_bypass = true;
                console.log("connected");
                clearTimeout(timer);
            }
            run_message?.(message);
        });

        const reset = () => {
            /*清理垃圾*/
            this._used_bypass = false;
            this._used_bypass_connecting = true;
            // remove unused_message
            this.#on_message =
                this.#off_message =
                    run_message = noop;

            _cached.clear();
            this.error("connected timeout or disconnect");
            _connected.onDisconnect.removeListener(reset);
        };
        _connected.onDisconnect.addListener(reset);
        const timer = setTimeout(reset, 2000);
        return this;
    }

    load() {
        this.version(3).stores({
            system: "++id,version",
            wordbook: "++book_id,book_name,book_info"
        });
        this.system = this.table("system");
        this.wordbook = this.table("wordbook");
    }

    use_background() {
        this._used_bypass = false;
        this.load();
        // 监听和自己频道相关的信息
        browser.runtime.onConnect.addListener((connector) => {
            if (connector.name !== "db") return;
            connector.postMessage({
                type: "connected"
            });
            this.#connector = connector;
            this.#send_message = (message: any) => {
                _connected.postMessage(message);
            };
            connector.onMessage.addListener((message: any) => {
                this[message.url]();
            });
        });
    }

    #queue = [];

    async make_query_channel({
                                 url,
                                 signal,
                                 timeout = undefined,
                                 params,
                             }: {
        url: string;
        params: any;
        signal?: AbortSignal,
        timeout?: number,
    }) {

        if (this._used_bypass) {
            if (this._used_bypass_connecting) {
                this.#queue.push({
                    url,
                    signal,
                    timeout,
                    params,
                });
            } else {
                this.#queue.forEach(params=>this.make_query_channel())
            }
            let _unlistened: boolean = false;
            let _timer = null;
            let unlisten = () => {
                _unlistened = true;
                console.error("_unlistened");
                promisify.cancel = noop;
                unlisten = noop;
            };

            // 一次只能有一次请求
            const promisify = new Promise((resolve) => {
                if (_timer) clearTimeout(_timer);
                const handle = (message: any) => {
                    if (message.type !== url) return;
                    if (_unlistened) return this.#off_message(handle);
                    this.#off_message(handle);
                    unlisten();
                    resolve(message);
                };
                this.#on_message?.(handle);
            });
            promisify.cancel = unlisten;

            if (isUndefined(timeout)) {
                _timer = setTimeout(() => {
                    unlisten();
                }, timeout);
            }
            return promisify;
        }
        this.wordbook.add({
            book_name: wordbook,
        });
        return this.wordbook;
    }
}

export class OpenTranslatorDB extends DB {


//    async saveWorkbook(wordbook: string) {

//    }
    /**/
    query() {
    }


    query_wordbook_by_page() {
        console.log(`this._used_bypass-->${this._used_bypass}`);

        if (this._used_bypass) {
            return this.make_query_channel({
                url: "query_wordbook_by_page",
                params: {}
            });
        }

        return this.wordbook.limit(100).toArray();

    }
}

export const db = new OpenTranslatorDB(pkg.name);
