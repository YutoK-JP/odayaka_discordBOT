const { Events, ButtonBuilder, ChannelType, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  type: Events.VoiceStateUpdate,
  nick: "vcCreate",
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
    if (vcsetting[guild.id].hub_channel === enteredChannel.id) {

      //処理に必要なデータ一覧
      //カテゴリ，既存のチャンネルとその名前リスト，
      const category = guild.channels.cache.get(vcsetting[guild.id].vc_category);
      const channelList = category.children.cache;
      const channelNamelist = channelList.map(channel => channel.name);

      //登録済みゲームは自動で命名
      const nameTemplates = client.knownGames;
      let voiceTemplate = nameTemplates["default"];

      const Activities = member.presence?.activities;

      if (Activities) {
        const knownActivities = member.presence.activities.filter(activity => Object.keys(nameTemplates).includes(activity.applicationId));
        if (knownActivities.length > 0) {
          voiceTemplate = nameTemplates[knownActivities[0].applicationId];
        }
      }

      //"<テンプレート名> X"の中で最新に
      let i = 1;
      while (channelNamelist.includes(`${voiceTemplate} ${i}`)) i++;

      //新チャンネルを作成
      const newChannel = await category.children.create({
        name: `${voiceTemplate} ${i}`,
        type: ChannelType.GuildVoice,
      });

      newstate.setChannel(newChannel);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ChangeChannelName")
            .setLabel("変更")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("ChangeChannelNameCancel")
            .setLabel("変更しない")
            .setStyle(ButtonStyle.Secondary),
        );

      await newChannel.send({ content: `VCデータ\n入室カウント:{1}\nタイムスタンプ:(${new Date().getTime()})` })
      await newChannel.send({ content: `${newstate.member}\n新チャンネルの名前を変更する場合は下のボタンをクリックしてください`, components: [row] });
    }
  }
}
