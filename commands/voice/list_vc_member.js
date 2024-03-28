const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('listupvc')
  .setDescription("VC内のメンバーをランダムな順番にリストアップします"),
  
  execute: async function(interaction, client, env){
    const vc = interaction.member.voice.channel;
    if(!vc) {
      interaction.reply({content:"VCに参加している必要があります", ephemeral: true});
      return;
    }
    
    let members = shuffleArray(vc.members.map(mem => mem.displayName));

    const messageEmbed = new EmbedBuilder()
      .setColor(0x7289da)
      .setTitle("VCメンバーリスト")
      .setDescription(members.join("\n"));

    interaction.reply({ embeds: [messageEmbed], ephemeral: true});
    console.log(members);
  }
}

function shuffleArray(array)
{
  const len = array.length;
  let tmp, t;
  for(let i=0; i<5; i++)
  {
    for(let j=0; j<len; j++)
    {
      t = Math.floor(Math.random() * (len-j));

      tmp = array[j];
      array[j] = array[t];
      array[t] = tmp;
    }
  }
  return array
}