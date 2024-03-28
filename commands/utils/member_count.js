const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('member')
    .setDescription("このサーバーの参加人数を通知します。"),
  permissions: ['SEND_MESSAGES'],
  
  execute: async function(interaction){
    await interaction.reply({content:`今のメンバー数は${interaction.guild.memberCount}人だよ！`, ephemeral: true});
  }
}

