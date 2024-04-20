import {describe, test} from "vitest";
import {injectedShadowName} from "../../shared/constants";

describe("Content Scripts 测试集", () => {
    test("应该存在注入的标签:" + injectedShadowName, async () => {
        const page = await browser.newPage();
        await page.goto("https://google.com");
        await page.content();
        await page.waitForSelector(injectedShadowName);
    });

});
