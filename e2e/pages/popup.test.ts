import {describe, expect, test} from "vitest";
import {defaultSettings} from "../../shared/config";
import pkg from "../../package.json";

export async function openPopup() {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.content();
    /*保证标题相等*/
    expect(await page.title()).toEqual(pkg.name);
    const button = await page.waitForSelector('button');
    await button.click();
    console.log();

    return {
        async save() {
            await button.click();
        },
        async getStorage() {
            return await page.evaluate(() => window.localStorage);
        },
        async getLocalStorage() {
            await page.evaluate(`async () => await chrome.storage.local.set(${JSON.stringify(defaultSettings)})`);
            return await page.evaluate(`async () => await chrome.storage.local.get(${JSON.stringify(Object.keys(defaultSettings))})`);
        }
    };
}

describe("Popup 相关测试", () => {
    test("try open", async () => {
        const popup = await openPopup();
        await popup.save();
        expect(await popup.getLocalStorage());
    });
});
