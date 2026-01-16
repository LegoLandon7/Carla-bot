// imports
require('dotenv').config();
const { detectLanguage } = require('./translate-model.js');
const textToSpeech = require('@google-cloud/text-to-speech');

// client
const client = new textToSpeech.TextToSpeechClient();

// main tts
async function ttsOutput(text) {
    try {
        // detect language
        const langCode = await detectLanguage(text, true);

        // tts
        const request = {
            input: { text },
            voice: { languageCode: langCode, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        // return
        const [response] = await client.synthesizeSpeech(request);
        return response.audioContent;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// exports
module.exports = { ttsOutput };