import {describe, expect, test, vi} from "vitest";
import {defaultSettings} from "../../shared/config";
import pkg from "../../package.json";
import path from "node:path";

export async function openPopup() {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.content();
    /*保证标题相等*/
    expect(await page.title()).toEqual(pkg.name);
    const button = await page.waitForSelector('button');
    await button.click();
    await page.screenshot({path: path.resolve(snapshotDir, 'popup.png')});

    return {
        async save() {
            await button.click();
        },
        async getStorage() {
            return await page.evaluate(() => window.localStorage);
        },
        async getLocalStorage() {
            await page.evaluate(`async () => await chrome.storage.local.set(${JSON.stringify(defaultSettings)})`);
            return await page.evaluate(`async () => await chrome.storage.local.get(["installData"])`);
        }
    };
}

describe("Popup 相关测试", async () => {
    const env = await browser.version();
    const expected = '2023-12-22T15:27:25.950Z';
    vi.setSystemTime(expected);

    test(env + "store installed data", async () => {
        const popup = await openPopup();
        await popup.save();
        console.log(await popup.getLocalStorage());

        expect(await popup.getLocalStorage());
    });
});
