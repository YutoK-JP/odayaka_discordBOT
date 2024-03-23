const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const cmdName = 'teamvc'

module.exports = {
  name:cmdName,
  data: new SlashCommandBuilder()
  .setName(cmdName)
  .setDescription("VC内のメンバーをランダムな順番にリストアップします")
  .addIntegerOption(option=>
    option.setName('チーム数')
    .setDescription("作成するチーム数")
    .setRequired(true)),
  
  async execute(interection, client, env){
    const vc = interection.member.voice.channel;
    if(!vc) {
      interection.reply({content:"VCに参加している必要があります", ephemeral: true});
      return;
    }

    const teamN = interection.options._hoistedOptions[0].value;
    const vcMembers = vc.members.map(mem => mem.displayName);

    if (vcMembers.length < teamN){
      interection.reply({content:"チーム数はメンバー数より多い値で指定してください。", ephemeral: true});
      return;
    }
    
    let members = shuffleArray(vcMembers);
    let teams = creatingTeams(members, teamN);

    let infoFields = []
    teams.forEach((membersTeam, idxTeam, teams) => {
      let field = {name : `チーム${idxTeam+1}`, value: membersTeam.join("\n")};
      infoFields.push(field);
    });

    const messageEmbed = new EmbedBuilder()
      .setColor(0x7289da)
      .setTitle("VCメンバーリスト")
    
    infoFields.forEach(element => {messageEmbed.addFields(element)});

    interection.reply({ embeds: [messageEmbed] });
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

function creatingTeams(memberArray, n)
{
  let teamArray = new Array(n);
  for(let i=0; i<n; i++) teamArray[i]=[];
  memberArray.forEach((element, idx) => {
    teamArray[idx%n].push(element);
  });
  return teamArray;
}