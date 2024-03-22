module.exports = {
    name:"idcheck",
    async execute(message, args, client, env){
        if(message.bot) return;
        if(message.guildId != "894602698102542437") return;
        const kinGuild = await client.guilds.fetch("763425893741363210");

        const data = await kinGuild.members.fetch(args[0]);
        console.log(data);
        message.reply(data.user.tag);
    }
    
}
