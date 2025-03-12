const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tabela")
    .setDescription("Mostra a tabela de ranking"),
  
  async execute(interaction) {
    const ranking = db.prepare("SELECT nome, pontos FROM jogadores ORDER BY pontos DESC").all();

    const itemsPerPage = 10;
    const totalPages = Math.ceil(ranking.length / itemsPerPage);

    function generateEmbed(page) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = ranking.slice(startIndex, endIndex);

      let description = "";
      pageItems.forEach((player, index) => {
        const overallIndex = startIndex + index;
        let medal = "";
        switch (overallIndex) {
          case 0:
            medal = "🥇";
            break;
          case 1:
            medal = "🥈";
            break;
          case 2:
            medal = "🥉";
            break;
        }
        description += `**${overallIndex + 1}.** ${player.nome} ${medal}\n${player.pontos} pontos\n\n`;
      });

      return new EmbedBuilder()
        .setTitle(`Ranking - Página ${page}/${totalPages}`)
        .setColor("Blue")
        .setDescription(description)
        .setFooter({ text: "Atualizado agora mesmo" })
        .setTimestamp();
    }

    function generateButtons(page) {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`leaderboard_prev_${page}`)
          .setLabel("Página Anterior")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`leaderboard_next_${page}`)
          .setLabel("Próxima Página")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages)
      );
    }

    const page = 1;
    const embed = generateEmbed(page);
    const buttons = generateButtons(page);

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
    });
  },
};
