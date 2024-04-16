import TranslateRolePrompt from "./role/role_prompt.md?raw"
import TranslateSysPrompt from "./sys/translator.md?raw"

const sys_map = {
    'translator': TranslateSysPrompt,
}
const role_map = {
    'translator': TranslateRolePrompt,
}
export async function callOpenAI(inputText: string, targetLanguage: string, apiKey: string) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: sys_map['translator'] },
                {
                    role: "user",
                    content: role_map['translator']
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

export default defineUnlistedScript({
    main() {

    }
})