# OpenAiTranslator

## 功能点实现情况
- It offers three modes: translation, polishing and summarization.
- Our tool allows for mutual translation, polishing and summarization across 55 different languages.
- Streaming mode is supported!
- It allows users to customize their translation text.
- [ ] One-click copying
- [ ] Text-to-Speech (TTS)
- [ ] Available on all platforms (Windows, macOS, and Linux) for both browsers and Desktop
- Support screenshot translation
- Support for vocabulary books, as well as support for generating memory aids based on the words in the vocabulary books
- Supports both OpenAI and Azure OpenAI Service at the same time

## 部署引擎

```sh
docker run -d -p 8080:8080 -p 1337:1337 -p 7900:7900 --shm-size="2g" -v ${PWD}/hardir:/app/hardir hlohaus789/g4f:latest
```
