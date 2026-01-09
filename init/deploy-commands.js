// deploy-commands.js
const fs = require('fs');
const path = require('path');
const { REST, Routes, MessageFlags } = require('discord.js');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    // Read only files directly inside the folder
    const commandFiles = fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter(file =>
            file.isFile() &&
            file.name.endsWith('.js')
        );

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file.name);
        const command = require(filePath);

        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('🔁 Refreshing application slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully registered ${commands.length} commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();