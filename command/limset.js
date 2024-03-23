const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  name:'ninzu',
  data: new SlashCommandBuilder()
  .setName('ninzu')
  .setDescription("VCの人数制限を変更します")
  .addIntegerOption(option=>
    option.setName('人数')
    .setDescription("人数制限")
    .setRequired(true)),
  
  async execute(interection, client, env){
    const vc = interection.member.voice.channel
    if(!vc) {
      interection.reply({content:"VCに参加している必要があります", ephemeral: true});
      return;
    }

    
    let n = interection.options._hoistedOptions[0].value;

    if(n!=0)
    {
      const m = vc.members.size;
      n = Math.max(m,n);
    }
    

    vc.setUserLimit(n);
    
    const actorname = interection.user.username
    var date = new Date();
    date=date.toLocaleString();

    console.log("text file is writing...")
    fs.appendFileSync(env.limitVoiceLogFile, `[${date}]「${actorname}」 has changed 「${vc.name}」's (in ${vc.parent.name}) limit into ${n!=0?n:'∞'}.\n`);
    console.log("text file was completely saved!")

    const vcobj = {channel_name:vc.name, parent_name:vc.parent.name, limit:n};
    const obj = {date:date, name:actorname, settings:vcobj};

    interection.reply({content:`人数制限を${n!=0?n:"∞"}人に変更しました。`, ephemeral: true});
  }
}
