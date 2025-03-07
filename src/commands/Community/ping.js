const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("this is ping command."),
  execute(interaction) {
    interaction.reply("pong!");
  },
};
