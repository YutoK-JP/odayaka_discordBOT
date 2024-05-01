const { Events } = require("discord.js");
const { encode } = require("punycode");

module.exports = {
  type: Events.VoiceStateUpdate,
  nick: "logging",
  async execute(oldstate, newstate, client, env) {
    const fs = require('fs');
    const now = new Date();
    const member = oldstate.guild.members.cache.get(oldstate.id);
    const data = `${member.displayName}(${oldstate.id}), ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}_${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}, ` +
      `${oldstate.channelId},${newstate.channelId}\n`;

    fs.appendFileSync(env.FILEPATH.VOICE_LOG, data, {encoding: 'utf-8'})
  }
}
