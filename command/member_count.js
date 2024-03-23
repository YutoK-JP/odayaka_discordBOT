const { SlashCommandBuilder } = require('@discordjs/builders');

const cmdName = "member"

module.exports = {
  name:cmdName,
  data: new SlashCommandBuilder().setName(cmdName).setDescription("このサーバーの参加人数を通知します。"),
  permissions: ['SEND_MESSAGES'],
  
  async execute(interection){
    await interection.reply({content:`今のメンバー数は${interection.guild.memberCount}人だよ！`, ephemeral: true});
  }
}

