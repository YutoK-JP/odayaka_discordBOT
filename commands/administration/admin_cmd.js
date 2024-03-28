const { SlashCommandBuilder } = require('@discordjs/builders');
const {PermissionsBitField} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription("※管理者用コマンドです。")
    .addStringOption(option=>
        option.setName('設定')
        .setDescription("設定")
        .setRequired(true)),
      
  execute : async function(interaction, client, env){
    //管理者権限がない場合は実行しない
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)){
        interaction.reply({content:"権限がありません。", ephemeral: true});
        return;
    }

    const command = interaction.options._hoistedOptions[0].value;

    if ( command.toLowerCase() == "sethub" ){
        const user = interaction.member;
        const guild = interaction.guild;
        const voicechannel = user.voice.channel;

        if (!voicechannel){
            interaction.reply({content:"VCに参加後コマンドを実行してください。"});
            return;
        }

        const fs = require("fs");
        const settingPath = './conf/vc_auto_setting.json'

        let setting_object = JSON.parse(fs.readFileSync(settingPath, 'utf8'));

        let exists_guild = Object.keys(setting_object).includes(guild.id);
        
        setting_object[guild.id] = { 
            "hub_channel": voicechannel.id, 
            "category":voicechannel.parent.id
        };
        
        fs.writeFileSync(settingPath, JSON.stringify(setting_object, null, 2));

        client.voiceAutoSetting[guild.id] = { 
            "hub_channel": voicechannel.id, 
            "category":voicechannel.parent.id
        };
        
        if(exists_guild)
            interaction.reply({content:"ハブチャンネルを更新しました。", ephemeral: true});
        else
            interaction.reply({content:"ハブチャンネルを新たに設定しました。", ephemeral: true});
        
        return;
    }
    else
    {
        interaction.reply({content:"コマンドが設定されていません。", ephemeral: true});
        return
    }
  }
}
