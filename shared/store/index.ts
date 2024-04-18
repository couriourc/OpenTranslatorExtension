import {atom, useAtom} from "jotai";
import {storage} from 'wxt/storage';
import {atomWithStorage, atomWithReset} from 'jotai/utils';
import {GPTEngine} from "@/shared/designPattern/Singleton.ts";
import {atomWithImmer, useImmerAtom} from "jotai-immer";

export interface IPanelStore {
    isOpen: boolean;
    isClose: boolean;
    openAiKey: string;
}

export const PanelStore = atomWithImmer<IPanelStore>({
    isOpen: false,
    isClose: false,
    openAiKey: "sk-aLHe5YUN91bM9QYqgdlWD0r6WKkR4tqhG5kHwejAbX6BhDfb",
});
export const usePanelStore = () => useImmerAtom(PanelStore);