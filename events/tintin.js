const {Events} = require('discord.js');

module.exports = {
  type: Events.MessageCreate,
  nick: "tintin",
  async execute(message, client, env) {
    console.log("Hi!")
    if (message.author.bot) return;
    if (message.channelId != env.CHANNELS.TINTIN) return;
    
    const patterns = {
      "ちんちん侍": "ち  ん  ち  ん  侍！！",
      "おちんちん": "びろ～ん",
      "侍": "シャキーン！",
      "ちんちん": "ちんちん"
    }
    const msg = message.content
    for (let key in patterns)
    {
      if (msg==key){
        message.channel.send({content:patterns[key]});
        break;
      } 
    }
    
  }
}
