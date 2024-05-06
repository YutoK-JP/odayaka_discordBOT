const { Events, ButtonBuilder, ChannelType, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  type: Events.VoiceStateUpdate,
  nick: "vcCount",
  async execute(oldstate, newstate, client) {
    //参加もしくは移動時にのみ実行
    if (!(newstate.channel)) return;
    const vcsetting = client.guildSettings;
    //未登録のサーバーでは実行しない
    if (!Object.keys(vcsetting).includes(newstate.guild.id)) return;

    const enteredChannel = newstate.channel;
    const guild = newstate.guild;
    const member = newstate.member;

    //参加チャンネルとハブチャンネルのidが一致
    if (vcsetting[guild.id].hub_channel !== enteredChannel.id && vcsetting[guild.id].hub_channel !== oldstate?.channelId && vcsetting[guild.id].vc_category === enteredChannel.parentId) {
      const messages = await enteredChannel.messages.fetch();
      const statMessage = messages.filter(mes => mes.author.id === client.user.id && mes.content.startsWith("VCデータ")).first();
      if(!statMessage) return;
      let statMesStr = statMessage.content;
      let splitedStr = statMesStr.split(/{|}/);

      statMesStr = `${splitedStr[0]}{${Number(splitedStr[1]) + 1}}${splitedStr[2]}`

      statMessage.edit(statMesStr);
    }
  }
}
