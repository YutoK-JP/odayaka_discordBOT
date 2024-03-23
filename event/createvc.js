const { EmbedBuilder, ChannelType} = require('discord.js');

module.exports = {
  type:"voiceStateUpdate",
  nick:"dm",
  async execute(oldstate, newstate, client){
    //参加もしくは移動時にのみ実行
    if(!(newstate.channel)) return;
    const vcsetting = client.voiceAutoSetting;
    //未登録のサーバーでは実行しない
    if(!Object.keys(vcsetting).includes(newstate.guild.id)) return;

    const enteredChannel = newstate.channel;
    const guild = newstate.guild;

    //参加チャンネルとハブチャンネルのidが一致
    if( vcsetting[guild.id].hub_channel === enteredChannel.id ) {
      
      //処理に必要なデータ一覧
      //カテゴリ，既存のチャンネルとその名前リスト，
      const category = guild.channels.cache.get(vcsetting[guild.id].category);
      const channelList = category.children.cache;
      const channelNamelist = channelList.map(channel => channel.name);

      //Voice room xの中で最新に
      let i = 1;
      while(channelNamelist.includes(`Voice room ${i}`)) i++;

      //新チャンネルを作成
      const newChannel = await category.children.create({
        name: `Voice room ${i}`,
        type: ChannelType.GuildVoice,
      });

      newstate.setChannel(newChannel);
    }
  }
}
