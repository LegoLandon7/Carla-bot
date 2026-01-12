const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

// language codes for tts
const langMap = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    de: 'de-DE',
    it: 'it-IT',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ru: 'ru-RU'
};

const languages = [
    { name: 'English', value: 'en' },
    { name: 'French', value: 'fr' },
    { name: 'Spanish', value: 'es' },
    { name: 'German', value: 'de' },
    { name: 'Japanese', value: 'ja' }
]

// detect language
async function detectLanguage(text, mapLang = false) {
    const [detection] = await translate.detect(text);
    const ttsLang = mapLang ? langMap[detection.language] || 'en-US' : detection.language;
    return ttsLang;
}

async function translateText(text, from = 'auto', to = 'en') {
    // detect
    if (from === 'auto') {
        const [detection] = await translate.detect(text);
        from = detection.language;
    }

    if (from === to) return text;

    // translate
    try {
        const [translation] = await translate.translate(text, { from: from, to: to });
        return translation;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { detectLanguage, translateText, languages };




