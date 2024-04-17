import {atom, useAtom} from "jotai";

import {atomWithStorage} from 'jotai/utils';
import {GPTEngine} from "@/shared/designPattern/Singleton.ts";

export interface IPanelStore {
    isOpen: boolean;
    isClose: boolean;
    openAiKey: string;
}

export const PanelStore = atomWithStorage<IPanelStore>("PanelStore", {
    isOpen: false,
    isClose: false,
    openAiKey: "",
});

const SelectionAtom = atom<string>("");

export interface TranslateStore {
    selection: string;
}

export const TranslateStore = atom<TranslateStore>(async (get) => {
    const [panel_store] = usePanelStore();
    console.log();
    const [selection] = useAtom(SelectionAtom);
    const translated = atom<string>("");

    GPTEngine.then(async (gpt) => {
        await gpt.listModels(panel_store.openAiKey);
    });
    get(translated);
});

export const usePanelStore = () => useAtom(PanelStore);
