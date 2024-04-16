import {browser} from "wxt/browser";
import {makeOpenTranslatorMessage} from "./requestor";


export default defineBackground(() => {
    // Setup context
    browser.contextMenus?.create({
        id: browser.runtime.id,
        type: 'normal',
        title: 'OpenAi translator',
        contexts: ['page', 'selection'],
    }, () => {
        browser.runtime.lastError;
    });
    
    browser.contextMenus?.onClicked.addListener(async function (info) {
        const [tab] = await browser.tabs.query({active: true, lastFocusedWindow: true});
        tab.id &&
        browser.tabs.sendMessage(tab.id, makeOpenTranslatorMessage(info));
    });

    browser.commands.onCommand.addListener(async (command) => {
        switch (command) {
            case 'open-popup': {
                await browser.windows.create({
                    type: 'popup',
                    url: browser.runtime.getURL("/popup.html"),
                });
            }
        }
    });


    browser.runtime.onInstalled.addListener(({reason}) => {
        if (reason === "install") {
            browser.storage.local.set({installData: Date.now()});
        }
    });


});
