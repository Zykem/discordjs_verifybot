const Discord = require('discord.js');
const client = new Discord.Client({intents: ['GUILD_MEMBERS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILDS']});
const config = require('./config.json')
const { SlashCommandBuilder } = require('@discordjs/builders');
client.on('message', (message) => { 

});

client.on('ready', () => { 
    console.log(`/-/-/- Verification bot set up /-/-/-\nLogged in as: ${client.user.tag}`);
    
    client.user.setPresence({activities: [{

        type: 'STREAMING',
        name: config.mainCfg.activity_name

    }]})

    // slash commands handler
    const guildId = config.mainCfg.serverId;
    const guild = client.guilds.cache.get(guildId);
    let commands = guild.commands


    // small reminder since  i fought with  this for 5 minutes - OPTIONS NAMES CAN BE ONLY LOWERCASE
    commands.create({

        name: config.setupCfg.commandNameSetup,
        description: config.setupCfg.commandDescription,
        options: [

            {

                name: 'category',
                description: 'Select the Category where to create the channel',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.CHANNEL

            },
            {

                name: 'channelname',
                description: 'Specify the name of the Channel you want it to be',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING

            }
            

        ]

    })
});

client.on('interactionCreate', async (interaction) => {
	
    if(interaction.customId == 'verify') {

        if(!interaction.member.roles.cache.find(role=>role.id == config.setupCfg.verifiedRole_id)) {

            interaction.member.roles.add(config.setupCfg.verifiedRole_id)
            interaction.reply({

                content: 'You have succesfully verified yourself!',
                ephemeral: true

            })

        } else {

            interaction.reply({

                content: 'You are already verified!',
                ephemeral: true

            })

        }

    }
    
    // Verification /setup command
    if(interaction.commandName === config.setupCfg.commandNameSetup) {
        
        const verifyCategory = interaction.options.getChannel('category')
        const channelName = interaction.options.getString('channelname')
        const verifyEmbed = new Discord.MessageEmbed()
            .setTitle(config.embedCfg.title_Embed)
            .setDescription(config.embedCfg.desc_Embed)
            .setColor(config.embedCfg.color_Embed)
            .setFooter(config.embedCfg.footer_Embed)

        const row = new Discord.MessageActionRow()
            .addComponents(

                new Discord.MessageButton()
                    .setCustomId('verify')
                    .setLabel('Verify')
                    .setStyle('SUCCESS')

            )
        let everyoneRole = await interaction.guild.roles.everyone
        let memberRole = await interaction.guild.roles.cache.find(role => role.id == config.setupCfg.verifiedRole_id)

        if(verifyCategory.type != 'GUILD_CATEGORY') {

            interaction.reply({

                content: 'You picked a channel, not a category!',
                ephemeral: true

            })

        } else {
        let verifyChannel = interaction.guild.channels.create(channelName, {

            parent: verifyCategory,
            permissionOverwrites: [

                {
                    
                    id: everyoneRole.id,
                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                    deny: ['SEND_MESSAGES', 'ADD_REACTIONS']

                },
                {

                    id: memberRole.id,
                    deny: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']

                }

            ]

        }).then(channel => channel.send({

            embeds: [verifyEmbed],
            components: [row]

        }))
    }
    }
});

client.login(config.mainCfg.bot_token);

// copyright: zykem