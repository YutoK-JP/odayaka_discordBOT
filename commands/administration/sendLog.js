const { SlashCommandBuilder } = require('@discordjs/builders');
const { ReactionUserManager } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Events } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendlog')
    .setDescription("※管理者用コマンドです。"),
  permissions: ['SEND_MESSAGES'],
  
  execute: async function(interaction, client, env){
    if(!checkrole(interaction.member, env.AllowedViewLog)) {
      interaction.reply({content:"このコマンドを実行する権限がありません。", ephemeral: true});
      return
    }
    else{
      const fs = require("fs");
      var date = new Date();

      const overview = JSON.parse(fs.readFileSync(env.deleteLogFile));
      const embed = new EmbedBuilder()
          .setColor(0xaaaaaa)
          .setTitle("消去ログ（一部）")
          .setDescription(JSON.stringify(overview.slice(0, 10), null, "  "));

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("sendDeleteLogFile")
            .setLabel("全ファイルを送信")
            .setStyle(ButtonStyle.Primary)
      );
      
      interaction.reply({embeds:[embed], ephemeral: true, components: [row]});
      return;
    
    }
  }
}

function checkrole(member, roles)
{
    //console.log(member.roles.cache);
    const memberroles = Array.from(member.roles.cache.keys());

    for(var i=0; i<roles.length; i++)
    {
        if(memberroles.includes(roles[i]))
            return true;
    }
    return false;
}
