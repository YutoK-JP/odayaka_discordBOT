const { EmbedBuilder, ChannelType} = require('discord.js');

module.exports = {
  type:"voiceStateUpdate",
  nick:"dm",
  async execute(oldstate, newstate, client){
    //退出もしくは移動時にのみ実行
    if(!(oldstate.channel)) return;
    const vcsetting = client.voiceAutoSetting;
    const guild = oldstate.guild;
    const channel = oldstate.channel;
    //未登録のサーバーでは実行しない
    if(!Object.keys(vcsetting).includes(guild.id)) return;
    //退出チャンネルがハブカテゴリ内の場合のみ実行
    if(vcsetting[guild.id].category != channel.parent.id) return;
    //退出チャンネルがハブの場合実行しない
    if(vcsetting[guild.id].hub_channel === channel.id) return;

    //vc参加人数が0人の場合はチャンネルを削除
    let members = channel.members;
    if(members.size==0) oldstate.channel.delete();
  }
}
