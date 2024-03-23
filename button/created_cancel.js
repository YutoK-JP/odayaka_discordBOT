module.exports = {
  name:'ChangeChannelNameCancel',
  permissions: ['SEND_MESSAGES'],
  
  async execute(interaction, client, env){
    const channel = interaction.channel;
    interaction.reply("チャンネル名の変更はキャンセルされました。");
    const startMes = await channel.messages.fetch({ after: '0', limit: 1 });
    startMes.first().delete()
}
}
