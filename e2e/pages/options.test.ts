import {describe, it, expect} from "vitest";
import pkg from "../../package.json";
import path from "node:path";

async function openOption() {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await page.content();
    await page.screenshot({path: path.resolve(snapshotDir, 'options.png')});

    return {
        async titleEqualPkgName() {
            expect(await page.title()).toEqual(pkg.name);
        }
    };
}

describe("Options 相关测试", async () => {
    it("should loaded", async () => {
        const options = await openOption();
        await options.titleEqualPkgName();
    });
});
