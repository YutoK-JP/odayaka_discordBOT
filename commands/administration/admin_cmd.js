const { SlashCommandBuilder, } = require('@discordjs/builders');
const { PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,} = require("discord.js");
const {  ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription("※管理者用コマンドです。")
    .addStringOption(option =>
      option.setName('設定')
        .setDescription("設定")
        .setRequired(true)),

  execute: async function (interaction, client, env) {
    //管理者権限がない場合は実行しない
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !=="541617956208246794") {
      interaction.reply({ content: "権限がありません。", ephemeral: true });
      return;
    }

    const command = interaction.options._hoistedOptions[0].value;

    if (command.toLowerCase() == "sethub") {
      const user = interaction.member;
      const guild = interaction.guild;
      const voicechannel = user.voice.channel;

      if (!voicechannel) {
        interaction.reply({ content: "VCに参加後コマンドを実行してください。" });
        return;
      }

      client.guildSettings[guild.id] = {
        "hub_channel": voicechannel.id,
        "vc_category": voicechannel.parent.id
      };

      update(client, env);

      interaction.reply({ content: "ハブチャンネルを設定しました。", ephemeral: true });

      return;
    }

    else if (command.toLowerCase() == "setrec") {
      const guild = interaction.guild;

      //対象チャンネルの網羅
      const channels_whole = await guild.channels.fetch()
      const channels_filtered = channels_whole.filter(ch => ch.type==ChannelType.GuildText).filter(ch => ch.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel));

      let channels_name = {};
      let channels_option = [];
      await channels_filtered.each(async ch => {
        channels_name[ch.id] = ch.name

        channels_option.push(
          new StringSelectMenuOptionBuilder()
          .setLabel(ch.name)
          .setValue(ch.id)
        )
      })


      //対象ロールの網羅
      const roles_whole = await guild.roles.fetch()
      const roles_filtered = roles_whole.filter(role => role.mentionable);

      let roles_name = {};
      let roles_option = [];
      await roles_filtered.each(async role => {
        roles_name[role.id] = role.name

        roles_option.push(
          new StringSelectMenuOptionBuilder()
          .setLabel(role.name)
          .setValue(role.id)
        )
      })

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('recruitChannelSelect')
        .setPlaceholder('募集チャンネルを選択')
        .addOptions(...channels_option);

      const cancelButton = new ButtonBuilder()
        .setCustomId("cancelRecruitChannel_recruit")
        .setLabel("キャンセル")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      const row_menu = new ActionRowBuilder().addComponents(selectMenu);
      const row_button = new ActionRowBuilder().addComponents(cancelButton);

      const response = await interaction.reply({ ephemeral: true, components: [row_menu, row_button] });

      const collectorFilter = i => i.user.id === interaction.user.id;

      try {
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        if (confirmation.customId === 'recruitChannelSelect') {
          const roleselectMenu = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("mentionableRoleSelect")
                .setPlaceholder("募集の対象となるロールを選択してください。")
                .setMinValues(1)
                .setMaxValues(roles_option.length)
                .addOptions(...roles_option)
            );
          const responceRole = await confirmation.update({ components: [roleselectMenu, row_button] });
          const confirmationRole = await responceRole.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

          try {
            console.log(confirmationRole.customId);
            if (confirmationRole.customId === 'mentionableRoleSelect') {
              
              const embed = new EmbedBuilder()
                .setColor(0xaaaaff)
                .setTitle("募集作成")
                .setDescription("下の青いボタンをクリック\n ↓ \nロールを選択、制限人数を設定\n ↓ \n必要であれば備考を入力後、募集を開始できます。");

              const recruitRow = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId("createRecruit")
                    .setLabel("募集作成")
                    .setStyle(ButtonStyle.Primary)
                );
              await confirmationRole.update({ content: "設定が完了しました！", embed: [], components: [] });
              await confirmationRole.channel.send({ embeds: [embed], ephemeral: false, components: [recruitRow] })

              client.guildSettings[confirmation.channel.guildId]["recruit_display"] = confirmation.values[0];
              client.guildSettings[confirmation.channel.guildId]["recruit_targets"] = confirmationRole.values;
              update(client, env);
              console.log(client.guildSettings);
            }
          } catch (e) {
            await confirmation.delete();
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            console.log(e);
          }

        } else if (confirmation.customId === 'cancelRecruitChannel_recruit') {
          await confirmation.update({ content: 'Action cancelled', components: [] });
        }
      } catch (e) {
        await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        console.log(e);
      }
    }
    else {
      interaction.reply({ content: "コマンドが設定されていません。", ephemeral: true });
      return
    }
  }
}


function update(client, env) {
  const fs = require("fs");
  fs.writeFileSync(env.FILEPATH.GUILD_SETTINGS, JSON.stringify(client.guildSettings, null, 2));
}