/// 设计模式——模板方法
import {IMessageRequest, IModel} from "./interfaces";

export abstract class ABCGPTEngine {
    get isLocal() {
        return false;
    }

    // 列出当前方案支持的模型
    abstract listModels(apiKey: string | undefined): Promise<IModel[]>

    abstract sendMessage(req: IMessageRequest): Promise<void>
}
