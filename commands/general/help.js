// help.js
const { createEmbed, COLORS } = require('../../utils/embed.js');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Pagination } = require('pagination.djs');

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Explains every command')
    .addNumberOption(o => 
        o.setName('page')
        .setDescription('The page number to view')
        .setRequired(false))

const execute = async (interaction) => {
    await interaction.deferReply();

    // build pages
    let pages = [];

    pages.push({title: "**Page 1/6: General Commands** `/`", content: 
        "\n*note: these commands don't require a main command*\n" +
        "\n`ping` - gets the ping of the bot" +
        "\n`help` - explains every command"
    });
    pages.push({title: "**Page 2/6: Information Commands** `/info`", content: 
        "\n\n`nbot` - gets information about this bot" +
        "\n`user` - gets information about a specific user" +
        "\n`channel` - gets information about a specific channel" +
        "\n`role` - gets information about a specific role" +
        "\n`server` - gets information about a specific server" +
        "\n`avatar` - gets the avatar of a specific user"
    });
    pages.push({title: "**Page 3/6: Moderation Commands** `/mod`", content: 
        "\n*note: user inputs search for closest match, through user id, or mention*\n" +
        "\n`ban` - bans a user" +
        "\n`timeout` - times out a user" +
        "\n`unban` - unbans a user" +
        "\n`untimout` - untimes out a user" +
        "\n`kick` - kicks a user" +
        "\n`setnick` - sets a nickname to a user" +
        "\n`setrole` - edits a users role" +
        "\n`echo` - sends a message in a certain channel" +
        "\n`dm` - sends a message to a certain user in dms"
    });
    pages.push({title: "**Page 4/6: Timer Commands** `/timers`", content: 
        "\n*note: timers automatically send messages in channels at certain intervals*\n" +
        "\n`create` - creates a timer with a specific id" +
        "\n`delete` - deletes a timer with a specific id" +
        "\n`clear` - deletes all timers" +
        "\n`toggle` - disables or enables a timer with a specific id" +
        "\n`view` - views a timer with a specific id" +
        "\n`list` - lists all timers"
    });
    pages.push({title: "**Page 5/6: Triggers Commands** `/triggers`", content: 
        "\n*note: triggers automatically send a message when it sees the trigger message*\n" +
        "\n`create` - creates a trigger with a specific id" +
        "\n`delete` - deletes a trigger with a specific id" +
        "\n`clear` - deletes all triggers" +
        "\n`toggle` - disables or enables a trigger with a specific id" +
        "\n`view` - views a trigger with a specific id" +
        "\n`list` - lists all triggers"
    });
    pages.push({title: "**Page 6/6: Other Commands `/`**", content: 
        "\n*note:these commands are an assortment of  fun and useful commands*\n" +
        "\n`google search` - searches google for a query" +
        "\n`gpt prompt` -askes chatGPT a prompt" +
        "\n`translate text` - translates text using google translate" +
        "\n`translate detect-language` - detects language using google translate" +
        "\n`tts speak` - send an mp3 of tts using google tts"
    });

    // page data
    let currentPage = interaction.options.getNumber('page') || 1;
    if (currentPage > 5) currentPage = 5;
    if (currentPage < 1) currentPage = 1;

    // build embeds
    const embeds = pages.map(p => 
        createEmbed(p.title, p.content, COLORS.INFO, interaction.client.user, false)
    );

    // init pagination
    const pagination = new Pagination(interaction);
    pagination
        .setEmbeds(embeds)
        .setAuthorizedUsers([interaction.user.id])
        .setIdle(60000) // 60 seconds
        .render();
}

module.exports = { data, execute, cooldown: 60 };
