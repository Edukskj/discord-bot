const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Mostra o status do usuário."),
  async execute(interaction, client) {

    const user = interaction.user;

    // dados de exemplo so pra ver se vai dar certo
    const level = 10;
    const partidasJogadas = 45;
    const kills = 27;
    const vitorias = 26;

    const winRate = partidasJogadas > 0 
      ? ((vitorias / partidasJogadas) * 100).toFixed(2) + "%"
      : "0%";

    const statusEmbed = new EmbedBuilder()
      .setTitle(`Status de ${user.username}`)
      .setColor("Green")
      .addFields(
        { name: "Level", value: String(level), inline: true },
        { name: "Partidas", value: String(partidasJogadas), inline: true },
        { name: "Kills", value: String(kills), inline: true },
        { name: "% Win Rate", value: winRate, inline: true },
        { name: "Vitórias", value: String(vitorias), inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Status" })
      .setTimestamp();

    await interaction.reply({ embeds: [statusEmbed] });
  },
};
