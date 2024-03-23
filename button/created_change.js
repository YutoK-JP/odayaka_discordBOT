const { Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = {
  name:'ChangeChannelName',
  permissions: ['SEND_MESSAGES'],
  
  async execute(interaction, client, env){
    const modal = new ModalBuilder()
			.setCustomId('changingVCname')
			.setTitle('VC名変更');
    
    const newNameInput = new TextInputBuilder()
			.setCustomId('newName')
			.setLabel("変更後のチャンネル名を入力してください。")
			.setStyle(TextInputStyle.Short);

    const inputRow = new ActionRowBuilder().addComponents(newNameInput);
    modal.addComponents(inputRow);
    await interaction.showModal(modal);
  }
}
