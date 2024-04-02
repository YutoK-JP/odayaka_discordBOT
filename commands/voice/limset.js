const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ninzu')
  .setDescription("VCの人数制限を変更します")
  .addIntegerOption(option=>
    option.setName('人数')
    .setDescription("人数制限")
    .setRequired(true)),
  
  execute: async function(interaction, client, env){
    const vc = interaction.member.voice.channel
    if(!vc) {
      interaction.reply({content:"VCに参加している必要があります", ephemeral: true});
      return;
    }

    
    let n = interaction.options._hoistedOptions[0].value;

    if(n!=0){
      const m = vc.members.size;
      n = Math.max(m,n);
    }
    vc.setUserLimit(n);

    interaction.reply({content:`人数制限を${n!=0?n:"∞"}人に変更しました。`, ephemeral: true});
  }
}
