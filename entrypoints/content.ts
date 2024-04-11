export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: "document_end",
  main(e) {
    setTimeout(() => {
    })
  },
});
