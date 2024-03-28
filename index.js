const express = require('express')
const { Client, GatewayIntentBits, Collection, Partials, Events} = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const cron = require('node-cron');
const path = require('node:path');

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

client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.legacyCommands = new Collection();
client.knownGames = JSON.parse(fs.readFileSync("./conf/vc_name_templete.json"))
const env = require("./configs.js");
const rest = new REST({ version: '9' }).setToken(env.TOKEN);
const prefix = "!";

//#region MODERN COMMAND
//BUILD SLASH COMMAND
const commandDirRoot = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandDirRoot);
for (const folder of commandFolders){
	const folderPaths = path.join(commandDirRoot, folder);	
	const commandFiles = fs.readdirSync(folderPaths).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(folderPaths, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.slashCommands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// BUTTON HANDLER 
const buttonDirRoot = path.join(__dirname, 'button');
const buttonFolders = fs.readdirSync(buttonDirRoot);

for (const folder of buttonFolders){
	const folderPaths = path.join(buttonDirRoot, folder);
	const buttonFiles = fs.readdirSync(folderPaths).filter(file => file.endsWith('.js'));
	for (const file of buttonFiles) {
		const filePath = path.join(folderPaths, file);
		const button = require(filePath);

		if ('execute' in button) {
			client.buttonCommands.set(button.name, button);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//SET SLASH COMMAND & BUTTON REACTION
client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isChatInputCommand()){
		const command = interaction.client.slashCommands.get(interaction.commandName);
		if(!command){
			console.log(`No command matching ${interaction.commandName} was found.`);
			interaction.reply({content:"コマンドの実行に問題が発生しました。", ephemeral:true});
			return;
		}

		try{
			await command.execute(interaction);
		}catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
	else if(interaction.isButton()){
		const button = interaction.client.buttonCommands.get(interaction.customId);
        if(!button){
			console.log(`No command matching ${interaction.commandName} was found.`);
			interaction.reply({content:"コマンドの実行に問題が発生しました。", ephemeral:true});
			return;
		}

        try{
			await button.execute(interaction);
		}catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
    }
});
//#endregion

//#region prejix command
//LEGACY COMMAND HANDLER
const lcomsFiles = fs.readdirSync('./legacy_com').filter(file => file.endsWith('.js'))
for (const file of lcomsFiles) {
    const command = require(`./legacy_com/${file}`)
    client.legacyCommands.set(command.name, command);
}

//VC SETTING REGISTER
client.voiceAutoSetting = require('./conf/vc_auto_setting.json');

// COMMAND REACTOR
client.on(Events.MessageCreate, message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.legacyCommands.has(command)) return;
	console.log("commanded.")
	try {
		client.legacyCommands.get(command).execute(message, args, client, env);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
//#endregion

// EVENT HANDLER
const eventDirRoot = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventDirRoot);

for (const folder of eventFolders){
	const folderPaths = path.join(eventDirRoot, folder);
	const eventFiles = fs.readdirSync(folderPaths).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(folderPaths, file);
		const event = require(filePath);
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
		console.log(`event ${event.nick} was registered.`);
	}
}

//SCHEDULE HANDLER
const cronFiles = fs.readdirSync('./cron').filter(file => file.endsWith('.js'))
for(const file of cronFiles){
    const schedule = require(`./cron/${file}`);
    console.log(schedule)
    cron.schedule(schedule.time, () => {schedule.execute(client, env)});
}



client.on(Events.ClientReady, client => {
	console.log(client.legacyCommands.keys());
	console.log("登録済みスラッシュコマンド");
    console.log(client.slashCommands.map(cmd => `${cmd.data.name} : ${cmd.data.description}` ));
});

client.login(env.TOKEN);