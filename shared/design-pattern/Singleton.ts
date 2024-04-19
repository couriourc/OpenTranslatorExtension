import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";

export class Singleton<T> {
    #instance: T | null = null;
    #loaded: boolean = false;
    #cached: ((instance: T) => any)[] = [];

    set(instance: T): Singleton<T> {
        if (this.#instance) {
            return this;
        }
        this.#instance = instance;
        setTimeout(this._loaded.bind(this));
        return this;
    }

    replace(instance: T): Singleton<T> {
        /**/
        this.#instance = instance;
        setTimeout(this._loaded.bind(this));
        return this;
    }

    get(): T {
        return this.#instance!;
    }

    _loaded() {
        this.#cached.forEach((fn) => {
            fn(this.#instance!);
        });
        this.#cached.length = 0;
    }

    is_loaded() {
        return !!this.#instance;
    }

    then(fn: ((instance: T) => any)): Singleton<T> {
        if (this.is_loaded()) {
            fn(this.#instance!);
            return this;
        }
        this.#cached.push(fn);
        return this;
    }
}

export const GPTEngine = new Singleton<AbstractOpenAI>();

export const WrapperHelper = new Singleton<{
    $ui: JQuery,
    dom: HTMLElement
}>();

export const MessagePool = new Singleton<ReturnType<typeof browser.runtime.connect>>();
