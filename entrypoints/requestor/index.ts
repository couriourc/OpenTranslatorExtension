import { Menus } from "wxt/browser";

const makeMessage = (type, args: Record<string, any>) => ({
    type: type,
    ...args,
});
export const makeOpenTranslatorMessage = (info: Menus.OnClickData) => makeMessage('open-translator', {
    info,
})


export default defineUnlistedScript({
    main() {

    }
})