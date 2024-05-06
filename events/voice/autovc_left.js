const { Events, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  type: Events.VoiceStateUpdate,
  nick: "vcDelete",
  async execute(oldstate, newstate, client, env) {
    //退出もしくは移動時にのみ実行
    if (!(oldstate.channel)) return;
    //未登録のサーバーでは実行しない
    if (!Object.keys(client.guildSettings).includes(oldstate.guild.id)) return;
    const vcsetting = client.guildSettings[oldstate.guild.id];
    //ハブのないサーバーでは実行しない
    if (!Object.keys(vcsetting).includes("hub_channel")) return;

    const guild = oldstate.guild;
    const channel = oldstate.channel;

    //退出チャンネルがハブカテゴリ内の場合のみ実行
    if (vcsetting.vc_category != channel.parent.id) return;
    //退出チャンネルがハブの場合実行しない
    if (vcsetting.hub_channel === channel.id) return;

    //募集機能を利用中のサーバーのみメッセージを探索
    if (Object.keys(vcsetting).includes("recruit_display")) {
      const recruit_channel = await guild.channels.fetch(vcsetting.recruit_display);
      const messages = await recruit_channel.messages.fetch({ limit: 30 });
      const recruit = messages.filter(mes => mes.content.includes(`id:${channel.id}`));
      recruit.each(r => r.delete());
    }
    //vc参加人数が0人の場合はチャンネルを削除
    let members = channel.members;
    if (members.size == 0) {
      const messages = await channel.messages.fetch();
      const statMessage = messages.filter(mes => mes.author.id === client.user.id && mes.content.startsWith("VCデータ")).first();
      if (statMessage) {
        const statMesStr = statMessage.content;
        const fs = require("fs");

        const vcname = channel.name;
        const vcid = channel.id;
        const count = statMesStr.split(/{|}/)[1];
        const timestamp = statMesStr.split(/\(|\)/)[1];
        const created = new Date(Number(timestamp));
        const duration = (Date.now() - timestamp) / 1000;

        const logtxt = `"${created.toLocaleString()}", "${vcname}"(${vcid}), ${count}, ` +
          `${String(Math.floor(duration / 3600)).padStart(2, "0")}:${String(Math.floor((duration % 3600) / 60)).padStart(2, "0")}:${String(Math.floor(duration % 60)).padStart(2, "0")}\n`;
        
        fs.appendFileSync(env.FILEPATH.VC_LOG, logtxt);
      }
      oldstate.channel.delete();
    }
    //ボイス記録用
    //console.log(oldstate.channel);
  }
}