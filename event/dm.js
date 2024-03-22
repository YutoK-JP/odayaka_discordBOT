const { EmbedBuilder } = require('discord.js');

module.exports = {
    name:"messageCreate",
    nick:"dm",
    async execute(message, client, env){
      if(message.channel.type != 1) return;
      if(message.author.bot) return;
      
      const sender = message.author;
      const admin_user = client.users.cache.get(env.JYAPPER);
              
      const embedContent = new EmbedBuilder()
        .setColor(0x00EEFF)
        .setTitle(sender.username)
        .setAuthor({name: sender.globalName})
        .setDescription(message.content);

      
      admin_user.send({embeds:[embedContent]});
    }
}
