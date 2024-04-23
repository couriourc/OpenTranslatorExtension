import Dexie, {Table} from "dexie";
import pkg from "@/package.json";
import {ISettings} from "@/shared/types.ts";

/**用于单词本信息记录
 * @Constructor {string} sysName 为了方便抽离使用
 * */
export abstract class DB extends Dexie {
    /**
     * @public 系统信息
     * */
    system!: Table<ISettings>;

    constructor(sysName: string) {
        super(sysName);
        this.version(1).stores({
            system: ""
        });
    }
}

export class OpenTranslatorDB extends DB {
}

export const db = new OpenTranslatorDB(pkg.name);
