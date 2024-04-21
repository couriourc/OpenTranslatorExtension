import {describe, test} from "vitest";
import {injectedShadowName} from "../../shared/constants";
import path from "node:path";

describe("Content Scripts 测试集", () => {
    test("应该存在注入的标签:" + injectedShadowName, async () => {
        const page = await browser.newPage();
        await page.goto(`https://puppeteer.bootcss.com/`);
        await page.content();
        await page.waitForSelector(injectedShadowName);

        const h1 = await page.$(".theme-doc-markdown h1");
//        await h1.focus();

        const rect = await page.evaluate((handle) => {
            const rect = handle.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
            };
        }, h1);

        await page.mouse.move(rect.left, rect.top);
        await page.mouse.down();
        await page.mouse.move(rect.left + 300, rect.top);
        await page.mouse.up({
            button: "left"
        });
        await page.screenshot({
            path: path.resolve(snapshotDir, "thumb.png")
        });
        const thumb = (await page.evaluateHandle(`document.querySelector("html > openai-translator").shadowRoot.querySelector("body > div > div > div:nth-child(3) > div")`)).asElement();
        //@ts-ignore
        await thumb?.click({
            button: "left",
        });

        await page.screenshot({
            path: path.resolve(snapshotDir, "translating.png")
        });
    });

});
