// retrieveCommands.js
const fs = require('fs');
const path = require('path');

function retrieveCommands(client) {
    client.commands = new Map();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);

        // Only read .js FILES, ignore folders (like /sub)
        const commandFiles = fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
            .map(entry => entry.name);

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            // Skip subcommands just in case
            if (command.data?.constructor?.name === "SlashCommandSubcommandBuilder") {
                console.log(`⏭️ Skipped subcommand: ${file}`);
                continue;
            }

            if (command.data) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Invalid command file: ${filePath}`);
            }
        }
    }

    console.log(`📦 Loaded ${client.commands.size} root slash commands`);
}

module.exports = { retrieveCommands };
