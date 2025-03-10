const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ranking = [
  { nome: "R4ndomJ", pontos: 75 },
  { nome: "Obammy", pontos: 75 },
  { nome: "@plot3sale", pontos: 50 },
  { nome: "NTS Reaper", pontos: 50 },
  { nome: "SR Mccock", pontos: 50 },
  { nome: "Rytas", pontos: 43 },
  { nome: "Lay Jeno", pontos: 43 },
  { nome: "Matt8", pontos: 43 },
  { nome: "Herikawa", pontos: 39 },
  { nome: "proaxiscockpit1", pontos: 31 },
  { nome: "proaxiscockpit1", pontos: 31 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tabela")
    .setDescription("Mostra a tabela de ranking"),

  async execute(interaction) {
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
      ephemeral: false,
    });
  },
};
