const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { hasPermission } = require('../utils/permissions.js');
require('dotenv').config();

// Map structure:
// serverCooldowns = Map<commandKey, Map<userId, timestamp>>
// commandKey = commandName or commandName.subcommandName
const serverCooldowns = new Map();

function handleSlashCommands(client) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Check if user can bypass cooldown (Admins/Mods)
        let canBypass = false;

        /*const canBypass = hasPermission(interaction.member, [
            'Administrator',
            'ManageGuild',
            'ModerateMembers'
        ]);*/

        // Bypass cooldowns for devs
        canBypass = process.env.DEV_IDS.split(',').map(id => id.trim()).includes(interaction.user.id);

        // --- Cooldown logic ---
        try {
            let subName = null;
            try { subName = interaction.options.getSubcommand(); } catch (_) {}
            
            // Use subcommand in key if exists
            const commandKey = subName ? `${command.name}.${subName}` : command.name;

            if (command.cooldown && !canBypass) {
                const now = Date.now();
                const ms = command.cooldown * 1000;
                const userId = interaction.user.id;

                if (!serverCooldowns.has(commandKey)) {
                    serverCooldowns.set(commandKey, new Map());
                }
                const cmdCooldowns = serverCooldowns.get(commandKey);

                if (cmdCooldowns.has(userId)) {
                    const expires = cmdCooldowns.get(userId);
                    if (now < expires) {
                        const remaining = ((expires - now) / 1000).toFixed(1);
                        return interaction.reply({
                            content: `⏳ This command is on cooldown.\nTry again in **${remaining}s**.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                }

                // Set new cooldown for this user and command/subcommand
                cmdCooldowns.set(userId, now + ms);
            }

            // --- Execute subcommand if it exists ---
            if (subName && command.subHandlers?.[subName]) {
                await command.subHandlers[subName](interaction);
                return;
            }

            // --- Execute main command ---
            if (command.execute) {
                await command.execute(interaction);
                return;
            }

            // Subcommand not found
            await interaction.reply({
                content: '❌ Subcommand not found.',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error(`❌ Error executing /${interaction.commandName}:`, error);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: '❌ There was an error while executing this command!'
                    });
                } else {
                    await interaction.reply({
                        content: '❌ There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral
                    });
                }
            } catch (_) {}
        }
    });
}

module.exports = { handleSlashCommands };
