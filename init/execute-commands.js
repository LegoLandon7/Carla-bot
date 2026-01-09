const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { hasPermission } = require('../utils/permissions.js')
const serverCooldowns = new Map();

// execute commands
function handleSlashCommands(client) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // bypass cooldown
        const canBypass = hasPermission(interaction.member, 
            ["Administrator", "ManageGuild", "ModerateMembers"]);

        // cooldown
        if (command.cooldown && !canBypass) {
            const userId = interaction.user.id; // per user
            const now = Date.now();
            const ms = command.cooldown * 1000;

            if (!serverCooldowns.has(command.name)) {
                serverCooldowns.set(command.name, new Map());
            }

            const cmdCooldowns = serverCooldowns.get(command.name);

            if (cmdCooldowns.has(userId)) {
                const expires = cmdCooldowns.get(userId);
                if (now < expires) {
                    const remaining = ((expires - now) / 1000).toFixed(1);
                    return interaction.reply({ content: `⏳ This command is on cooldown.\nTry again in **${remaining}s**.`, flags: MessageFlags.Ephemeral });
                }
            }

            // new cooldown
            cmdCooldowns.set(userId, now + ms);
        }

        // get subcommands
        try {
            let subName = null;
            try { subName = interaction.options.getSubcommand(); } catch (_){}

            if (subName && command.subHandlers?.[subName]) { await command.subHandlers[subName](interaction); return; }

            // execute
            if (command.execute) { await command.execute(interaction); return; }

            await interaction.reply({ content: '❌ Subcommand not found.', flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(`❌ Error executing /${interaction.commandName}:`, error);
            await interaction.reply({ content: '❌ There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    });
}

module.exports = { handleSlashCommands };