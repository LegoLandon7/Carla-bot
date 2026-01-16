// imports
require('dotenv').config();
const OpenAI = require('openai');

// client
const client = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

// ai contexts
const CONTEXTS = {
    BASE_CONTEXT: "Context:\n" +
        "- You are a friendly Discord (markdown, user ids valid) ai bot.\n" +
        "- Respond short, casual, and chatty. Avoid NSFW or harmful content.\n" +
        "- Reflect the user's tone slightly; never say you are a bot.\n" +
        "- Use emojis sparingly.\n" +
        "- Focus on the last message. Use history only if needed.\n" +
        "- Just chat; replies can be playful but fit the conversation.\n" +
        "- You are only a language model."
}

// main ai response
async function getAIResponse(textInput, context = null, modelName = 'gpt-5-nano') {
    // input string
    const aiInput = `${context}\n\n${textInput}`;

    // ai model
    const response = await client.responses.create({
        model: modelName,
        input: aiInput,
    });

    // return
    const text = response.output_text || response.output?.[0]?.content?.[0]?.text || "⚠️ No AI response [ERROR]";
    return text;
}

// exports
module.exports = { getAIResponse, CONTEXTS };