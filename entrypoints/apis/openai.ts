import TranslatePrompt from "./role_prompt.md?raw"
async function callOpenAI(inputText: string, targetLanguage: string, apiKey: string) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an excellent translator." },
                {
                    role: "user",
                    content: TranslatePrompt
                        .replace('<inputText>', inputText)
                        .replace('<targetLanguage>', targetLanguage)
                },
            ],
        }),
    });

    const data = await response.json();

    // Log the response object, response error details, and response data to the console
    console.log("Response object:", response);
    if (data && data.error) {
        console.log("Response error:", data.error);
    }
    console.log("Response data:", data);

    return data;
}