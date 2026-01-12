require('dotenv').config();
const { detectLanguage } = require('./translate_model.js');

const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

async function ttsOutput(text) {
    try {
        const langCode = await detectLanguage(text, true);

        const request = {
            input: { text },
            voice: { languageCode: langCode, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        return response.audioContent;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { ttsOutput };