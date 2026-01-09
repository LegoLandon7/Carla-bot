const fs = require('fs');
const path = require('path');

function ensureJson(filePath, defaultData = {}) {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

function readJson(filePath, defaultData = {}) {
    try {
        ensureJson(filePath, defaultData);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        console.error(`Failed to read JSON: ${filePath}`, err);
        return defaultData;
    }
}

function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Failed to write JSON: ${filePath}`, err);
    }
}

module.exports = {ensureJson, readJson, writeJson};