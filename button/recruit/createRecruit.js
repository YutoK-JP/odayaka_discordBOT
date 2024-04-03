const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { ButtonStyle, EmbedBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
module.exports = {
  name: 'createRecruit',
  permissions: ['SEND_MESSAGES'],
  execute: async function (interaction, client, env) {
    let recruitNum = 1;
    const targetRoles = client.guildSettings[interaction.guildId].recruit_targets;
    const role_label = {}
    let roleoptions = []
    await targetRoles.map(async roleId => {
      const role = await interaction.guild.roles.fetch(roleId);
      label = role.name;
      role_label[roleId] = label;

      roleoptions.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setValue(roleId)
      )
    });

    roleoptions.push(
      new StringSelectMenuOptionBuilder()
        .setLabel("ロール無し")
        .setValue("0")
    );

    let roleSelector = new StringSelectMenuBuilder()
      .setCustomId("recruitRoleSelect_recruit")
      .setPlaceholder("ロールを選択してください。")
      .addOptions(...roleoptions);

    const countDown = new ButtonBuilder()
      .setCustomId('countDown_recruit')
      .setLabel('-')
      .setStyle(ButtonStyle.Secondary);

    let countView = new ButtonBuilder()
      .setCustomId('countView_recruit')
      .setLabel(`募集人数: ${recruitNum == 1 ? "無制限" : recruitNum}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const countUp = new ButtonBuilder()
      .setCustomId('countUp_recruit')
      .setLabel('+')
      .setStyle(ButtonStyle.Secondary);

    const recruitButton = new ButtonBuilder()
      .setCustomId('confirmRecruit_recruit')
      .setLabel('募集開始')
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancelRecruit_recruit')
      .setLabel('キャンセル')
      .setStyle(ButtonStyle.Secondary);

    const rowSelector = new ActionRowBuilder().addComponents(roleSelector);
    const rowButton = new ActionRowBuilder().addComponents(recruitButton).addComponents(cancelButton);
    const rowCount = new ActionRowBuilder().addComponents(countDown).addComponents(countView).addComponents(countUp)

    const response = await interaction.reply({
      contents: "募集要項を選択後、募集ボタンをクリックしてください。",
      components: [rowSelector, rowCount, rowButton],
      ephemeral: true
    });

    const collectorFilter = i => i.user.id === interaction.user.id;
    let input_end = false;

    try {
      let confirmation
      let selectedRole = undefined;
      do {
        confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        switch (confirmation.customId) {
          case 'recruitRoleSelect_recruit':
            selectedRole = confirmation.values[0]
            const reselectRow = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reselect_recruit')
                  .setLabel(`再選択:現在[${selectedRole != "0" ? role_label[selectedRole] : "ロール無し"}]`)
                  .setStyle(ButtonStyle.Secondary)
              )
            await confirmation.update({ content: "ロールが選択されました", components: [reselectRow, rowCount, rowButton] });
            break;
          case 'reselect_recruit':
            selectedRole = undefined;
            await confirmation.update({ content: "ロールを再選択してください", components: [rowSelector, rowCount, rowButton] });
            break;
          case 'countDown_recruit':
          case 'countUp_recruit':
            if (confirmation.customId === 'countDown_recruit')
              recruitNum--;
            else
              recruitNum++;
            if (recruitNum < 1) recruitNum = 1;

            countView.setLabel(`募集人数: ${recruitNum == 1 ? "無制限" : recruitNum}`)
            if (!selectedRole)
              await confirmation.update({ components: [rowSelector, rowCount, rowButton], })
            else {
              const reselectRow = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('reselect_recruit')
                    .setLabel(`再選択:現在[${selectedRole != "0" ? role_label[selectedRole] : "ロール無し"}]`)
                    .setStyle(ButtonStyle.Secondary)
                )
              await confirmation.update({ components: [reselectRow, rowCount, rowButton], })
            }

            break;
          case 'confirmRecruit_recruit':
            if (!selectedRole) {
              await confirmation.update({ content: "ロールを選択してください。" })
              continue;
            }

            const modal = new ModalBuilder()
              .setCustomId('descriptModal')
              .setTitle('追加の備考')
              .addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId("descriptInput")
                  .setLabel("募集に備考がある場合は入力してください。")
                  .setStyle(TextInputStyle.Paragraph)
                  .setMaxLength(200)
                  .setRequired(false)
              ));

            await confirmation.showModal(modal);
            confirmation.awaitModalSubmit({ time: 60_000, collectorFilter })
              .then(async submittion => {
                const recruitChannel = interaction.guild.channels.cache.get(client.guildSettings[interaction.guildId].recruit_display);
                
                let targetRole
                if (selectedRole==="0"){
                  targetRole = undefined
                }else{
                  targetRole = await interaction.guild.roles.fetch(selectedRole)
                }

                const vc_category = await interaction.guild.channels.fetch(client.guildSettings[interaction.guildId].vc_category);
                const channelList = vc_category.children.cache;
                const channelNamelist = channelList.map(channel => channel.name);
                let voiceTemplate = targetRole ? targetRole.name : "Voice Room";

                let i = 1;
                while (channelNamelist.includes(`${voiceTemplate} ${i}`)) i++;

                const newVC = await vc_category.children.create({
                  name: `${voiceTemplate} ${i}`,
                  type: ChannelType.GuildVoice,
                  userLimit: recruitNum == 1 ? 0 : recruitNum
                });
                const discript = submittion.fields.getTextInputValue("descriptInput") ? submittion.fields.getTextInputValue("descriptInput") : "特になし";
                const embed = new EmbedBuilder()
                  .setColor(targetRole ? targetRole.color: 0xFFFFFF)
                  .setTitle("メンバー募集")
                  .setDescription("募集が作成されました。緑のボタンから参加できます。")
                  .addFields(
                    { name: '募集者', value: `${interaction.member.displayName}`, inline: true },
                    { name: 'ロール', value: `${targetRole ? targetRole : "なし"}`, inline: true },
                    { name: '募集人数', value: `${recruitNum == 1 ? "∞(特になし)" : recruitNum}`, inline: true },
                    { name: '備考', value: discript}
                  )

                await recruitChannel.send({ content: `${targetRole ? targetRole : ""} ${newVC.url}`, embeds: [embed] });
                await submittion.update({ content: `募集を作成しました。${newVC.url}`, components: [] })
                input_end = true;
              })
              .catch(err => console.log(err));

            break;
          case 'cancelRecruit_recruit':
            await confirmation.update({ content: "キャンセルしました", components: [] });
            input_end = true;
            break;
        }
      } while (!input_end);
    } catch (e) {
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
      console.log(e);
    }
  }
}
