import {AbstractOpenAI} from "@/shared/engines/ABCOpenAiEngine.ts";

export class Singleton<T> {
    #instance: T | null = null;
    #loaded: boolean = false;
    #cached: ((instance: T) => any)[] = [];

    set(newInstance: T): Singleton<T> {
        if (this.#instance) {
            this.#instance = newInstance;
            return this;
        }
        this.#instance = newInstance;
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
    }

    _is_loaded() {
        return !!this.#instance;
    }

    then(fn: ((instance: T) => any)): Singleton<T> {
        if (this._is_loaded()) {
            fn(this.#instance!);
            return this;
        }
        this.#cached.push(fn);
        return this;
    }
}

export const GPTEngine = new Singleton<AbstractOpenAI>();

export const WrapperHelper = new Singleton<{
    $ui:JQuery,
}>();
