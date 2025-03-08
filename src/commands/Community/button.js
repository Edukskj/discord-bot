const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("button-interaction")
    .setDescription("this is button command."),
  execute(interaction) {
    const button = new ButtonBuilder()
      .setCustomId("primary_button")
      .setLabel("Receba")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    interaction.reply({ components: [row] });
  },
};
