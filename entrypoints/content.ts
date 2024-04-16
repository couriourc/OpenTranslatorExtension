import { callOpenAI } from "./apis/openai"
function getSelectedText(): string {
  const selection = window.getSelection();
  return selection?.toString() ?? "";
}


export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: "document_end",
  main(e) {

    browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      if (request.action === "getSelectedText") {
        const selectedText = getSelectedText();
        console.log(await callOpenAI(selectedText))
        /* @ts-ignore */
        sendResponse({ text: selectedText });
      }
    });
    setTimeout(() => {
    })
  },
});
