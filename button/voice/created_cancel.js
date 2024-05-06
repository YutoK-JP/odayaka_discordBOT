module.exports = {
  name:'ChangeChannelNameCancel',
  permissions: ['SEND_MESSAGES'],
  
  execute: async function(interaction, client, env){
    const channel = interaction.channel;
    interaction.reply("チャンネル名の変更はキャンセルされました。");
    const messages = await channel.messages.fetch();
    const startMes = messages.filter(mes=>mes.author.id === client.user.id && mes.components.length>0);
    startMes.first().delete()
  }
}
