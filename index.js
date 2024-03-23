const express = require('express')
const { Client, GatewayIntentBits, Collection, Partials} = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');


const fs = require('fs');
const cron = require('node-cron');

prefix = "!";

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildPresences,
	],
	partials: [Partials.Channel] 
});

const commands = [];
const excuter = {};
let buttonCmd = [];
let buttonExe = {};
client.commands = new Collection();

const env = require("./configs.js")



//#region SLASH COMMAND
//BUILD SLASH COMMAND
const commandFiles = fs.readdirSync('./command').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./command/${file}`)
    commands.push(command.data.toJSON());
	excuter[command.name] = command.execute;
}

const rest = new REST({ version: '9' }).setToken(env.TOKEN);

//SET SLASH COMMAND
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		console.log(`commands:${JSON.stringify(commands)}`)
		await rest.put(
			Routes.applicationCommands(env.clientId),
			{ body: commands },
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

// BUTTON HANDLER 
const buttonFiles = fs.readdirSync('./button').filter(file => file.endsWith('.js'))
for (const file of buttonFiles) {
    const command = require(`./button/${file}`)
    buttonCmd.push(command.name)
	buttonExe[command.name] = command.execute;
}



client.on("interactionCreate", async (interaction) => {
    if(interaction.isButton()){
        if(!buttonCmd.includes(interaction.customId))
        {
            interaction.reply("No command proccess setting.");
        }
        else{
            await buttonExe[interaction.customId](interaction, client, env)
        }
        return;

    }else if (!interaction.isCommand()) {
        return;
	}

	console.log(excuter[interaction.commandName])
    try{
		await excuter[interaction.commandName](interaction, client, env);
	}
	catch(error){
		console.log("Interactoin Error")
		console.log(error)
		interaction.reply({content:"コマンドに何らかの問題が発生しました", ephemeral:true});
	}
});
//#endregion

//#region prejix command
//LEGACY COMMAND HANDLER
const lcomsFiles = fs.readdirSync('./legacy_com').filter(file => file.endsWith('.js'))
for (const file of lcomsFiles) {
    const command = require(`./legacy_com/${file}`)
    client.commands.set(command.name, command);
}

//VC SETTING REGISTER
client.voiceAutoSetting = require('./conf/vc_auto_setting.json');

// COMMAND REACTOR
client.on('messageCreate', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;
	console.log("commanded.")
	try {
		client.commands.get(command).execute(message, args, client, env);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
//#endregion

// EVENT HANDLER
const eventFiles = fs.readdirSync('./event').filter(file => file.endsWith('.js'))
for (const file of eventFiles){
    const event = require(`./event/${file}`);
	console.log(`event ${event.nick} was registered.`);
    if(event.once){
        client.once(event.type, (...args) => event.execute(...args, client, env))
        } 
    else {
        client.on(event.type, (...args) => {
            try{
            	event.execute(...args, client, env)
            }
            	catch (error) {console.error(error)}
        })
    }
}
//SCHEDULE HANDLER
const cronFiles = fs.readdirSync('./cron').filter(file => file.endsWith('.js'))
for(const file of cronFiles){
    const schedule = require(`./cron/${file}`);
    console.log(schedule)
    cron.schedule(schedule.time, () => {schedule.execute(client, env)});
}



client.on('ready', client => {
	console.log(client.commands)
    console.log(buttonExe)
});

client.login(env.TOKEN);