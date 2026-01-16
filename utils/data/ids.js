// imports
const { ensureJson, readJson, writeJson } = require('./files.js');
const path = require('path');

// data
const IDS_PATH = path.resolve(__dirname, '../../data/ids.json');

// generate id
async function generateId(guildId, type) {
    // read data
    ensureJson(IDS_PATH);
    const data = readJson(IDS_PATH, {});

    // init
    if (!data[type]) data[type] = {};
    if (!data[type][guildId]) data[type][guildId] = { newId: 0 };

    // increment id
    data[type][guildId].newId += 1;

    // write data
    writeJson(IDS_PATH, data);

    // return
    return data[type][guildId].newId.toString();
}

// exports
module.exports = { generateId };