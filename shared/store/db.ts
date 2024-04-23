import Dexie, {Table} from "dexie";
import pkg from "@/package.json";
import {ISettings} from "@/shared/types.ts";
import {noop} from "underscore";

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
        this.version(3).stores({
            system: "++id,version",
            wordbook: "++book_id,book_name,book_info"
        });
        this.system = this.table("system");
        this.wordbook = this.table("wordbook");

    }

    async saveWorkbook(wordbook: string) {
        // 在此处完成 unified
        if (this._used_bypass) {
            const obj = {};
            // 一次只能有一次请求
            return new Promise(() => {
                this.#on_message?.((message: string) => {

                });
            });
        }
        this.wordbook.add({
            book_name: wordbook,
        });
        return this.wordbook;
    }

    _used_bypass: boolean = false;
    #connector?: ReturnType<typeof browser.runtime.connect>;
    #on_message?: (fn: Function) => void;
    #off_message?: (fn: Function) => void;
    _used_bypass_connecting: boolean = false;

    error(reason: string) {
        console.error(reason);
    }

    use_bypass() {
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
        _connected.onMessage.addListener((message) => {
            if (message.type === "connected") {
                /*完成初始化链接*/
                this.#connector = _connected;
                this._used_bypass = true;
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

    use_background() {
        // 监听和自己频道相关的信息
        browser.runtime.onConnect.addListener((connector) => {
            if (connector.name !== "db") return;
            connector.postMessage({
                type: "connected"
            });
            connector.onMessage.addListener((message: any) => {
                console.log(message);
            });
        });
    }
}

export class OpenTranslatorDB extends DB {
}

export const db = new OpenTranslatorDB(pkg.name);
