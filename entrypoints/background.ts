import { browser } from "wxt/browser";
export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener(({ reason }) => {
    console.log(reason)
    if (reason === "install") {
      browser.storage.local.set({ installData: Date.now() })
    }
  })
});
