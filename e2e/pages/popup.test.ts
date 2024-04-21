import {describe, expect, test, vi} from "vitest";
import pkg from "../../package.json";
import path from "node:path";
import {defaultSettings} from "../../shared/config";

export async function openPopup() {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.content();
    /*保证标题相等*/
    expect(await page.title()).toEqual(pkg.name);
    const button = await page.waitForSelector('button:nth-child(1)');
    await page.screenshot({path: path.resolve(snapshotDir, 'popup.png')});
    await button.click({
        button: "left"
    });

    return {
        async save() {
            expect(await (await (button.getProperty("textContent"))).jsonValue()).toEqual("Save");
            await button.click();
        },
        async getLocalStorage() {
            await this.save();
            return await page.evaluate(async () => {
                const data = await chrome.storage.local.get(["installData", "settings"]);
                return {
                    ...data
                };
            });
        }
    };
}

describe("Popup 相关测试", async () => {
    const env = await browser.version();
    /*应该把基本数据存储进去*/
    test("store settings", async () => {
        const popup = await openPopup();
        await popup.save();
        expect((await popup.getLocalStorage()).settings).toEqual(defaultSettings);
    });
});
