const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

// language codes for tts
const langMap = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    ar: 'ar-SA',
    hi: 'hi-IN',
    bn: 'bn-BD',
    pa: 'pa-IN',
    ur: 'ur-PK',
    tr: 'tr-TR',
    vi: 'vi-VN',
    th: 'th-TH',
    nl: 'nl-NL',
    sv: 'sv-SE',
    pl: 'pl-PL',
    uk: 'uk-UA',
    ro: 'ro-RO',
    cs: 'cs-CZ'
};

// language names
const languages = [
    { name: 'English', value: 'en' },
    { name: 'Spanish', value: 'es' },
    { name: 'French', value: 'fr' },
    { name: 'German', value: 'de' },
    { name: 'Italian', value: 'it' },
    { name: 'Portuguese', value: 'pt' },
    { name: 'Russian', value: 'ru' },
    { name: 'Japanese', value: 'ja' },
    { name: 'Korean', value: 'ko' },
    { name: 'Chinese (Simplified)', value: 'zh' },
    { name: 'Arabic', value: 'ar' },
    { name: 'Hindi', value: 'hi' },
    { name: 'Bengali', value: 'bn' },
    { name: 'Punjabi', value: 'pa' },
    { name: 'Urdu', value: 'ur' },
    { name: 'Turkish', value: 'tr' },
    { name: 'Vietnamese', value: 'vi' },
    { name: 'Thai', value: 'th' },
    { name: 'Dutch', value: 'nl' },
    { name: 'Swedish', value: 'sv' },
    { name: 'Polish', value: 'pl' },
    { name: 'Ukrainian', value: 'uk' },
    { name: 'Romanian', value: 'ro' },
    { name: 'Czech', value: 'cs' }
];

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




