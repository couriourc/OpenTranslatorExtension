import {Menus} from "wxt/browser";
import {ERequestorEnum} from "./interfaces.ts";

const makeMessage = (type: ERequestorEnum, args: Record<string, any>) => ({
    type: type,
    ...args,
});
export const makeOpenTranslatorMessage = (info: Menus.OnClickData) => makeMessage(ERequestorEnum["open-translator"], {
    info,
});


