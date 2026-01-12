require('dotenv').config();

const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

async function ttsOutput(text) {
    try {
        const request = {
            input: { text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        return response.audioContent;
    } catch (err) {
        return "⚠️ Something went wrong";
    }
}

module.exports = { ttsOutput };