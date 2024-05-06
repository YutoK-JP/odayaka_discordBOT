const { Events } = require("discord.js");

module.exports = {
    type:Events.InteractionCreate,
    nick:"modal_res",
    async execute(interaction, client, env){
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== "changingVCname") return;

        const newName = interaction.fields.getTextInputValue('newName');
        const channel = interaction.channel;
        interaction.reply("チャンネル名を変更しました。");

        const messages = await channel.messages.fetch();
        const startMes = messages.filter(mes=>mes.author.id === client.user.id && mes.components.length>0);
        startMes.first().delete();
        channel.setName(newName);
    }
}
