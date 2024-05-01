const { Events } = require("discord.js");
const { encode } = require("punycode");

module.exports = {
  type: Events.VoiceStateUpdate,
  nick: "logging",
  async execute(oldstate, newstate, client, env) {
    const fs = require('fs');
    const now = new Date();

    if (oldstate.channel) {
      const leaveguild = oldstate.guild.id;
      if (client.guildSettings?.[leaveguild]?.hub_channel !== oldstate.channelId) {
        let hub = "none";

        if (client.guildSettings?.[leaveguild]?.vc_category === oldstate.channel?.parentId)
          hub = client.guildSettings?.[leaveguild]?.hub_channel

        const member = oldstate.guild.members.cache.get(oldstate.id);
        const data = `${member.displayName}(${oldstate.id}), ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}` +
          `_${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}, ${oldstate.channelId}, hub=${hub}\n`;
        fs.appendFileSync(env.FILEPATH.VOICE_LEAVELOG, data, { encoding: 'utf-8' });
      }
    }
    if (newstate.channel) {
      const enterguild = newstate.guild.id;
      if (client.guildSettings?.[enterguild]?.hub_channel !== newstate.channelId) {
        let hub = "none";

        if (client.guildSettings?.[enterguild]?.vc_category === newstate.channel?.parentId)
          hub = client.guildSettings?.[enterguild]?.hub_channel

        const member = newstate.guild.members.cache.get(newstate.id);
        const data = `${member.displayName}(${newstate.id}), ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}` +
          `_${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}, ${newstate.channelId}, hub=${hub}\n`;
        fs.appendFileSync(env.FILEPATH.VOICE_ENTERLOG, data, { encoding: 'utf-8' });
      }

    }




  }
}
