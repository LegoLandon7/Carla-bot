// resolve user
async function getUser(input, guild) {
    if (!input || !guild) return null;
    input = input.trim();

    // mention
    const mention = input.match(/^<@!?(\d+)>$/);
    if (mention) return (await guild.members.fetch(mention[1]).catch(() => null))?.user || null;

    // id
    if (/^\d+$/.test(input)) return (await guild.members.fetch(input).catch(() => null))?.user || null;

    // search cache
    const member = guild.members.cache.find(
        m =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            (m.nickname && m.nickname.toLowerCase() === input.toLowerCase())
    );

    return member ? member.user : null;
}

// get command user data (must defer reply and have target_user string field thats required)
async function getCommandUserData(interaction) {
    const user = await getUser(interaction.options.getString('target_user'), interaction.guild);

    if (!user) {
        await interaction.editReply({content: "❌ User not found."});
        return null; // stop
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const commandUser = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    const botMember = interaction.guild.members.me;

    if (!member || !commandUser || !botMember) {
        await interaction.editReply({content: "❌ Could not fetch member data."});
        return null; // stop
    }

    return { user, member, commandUser, botMember };
}

// mention user
function mentionUser(user) {return user ? `<@${user.id}>` : ""}

module.exports = {getUser, getCommandUserData, mentionUser};