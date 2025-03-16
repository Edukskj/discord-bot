const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tabela")
    .setDescription("Mostra a tabela de ranking"),
  
  async execute(interaction, client) {
    const configChannelRow = db.prepare("SELECT value FROM config WHERE key = 'top20_channel'").get();
    const configModeRow = db.prepare("SELECT value FROM config WHERE key = 'top20_mode'").get();

    const top20ChannelId = configChannelRow ? configChannelRow.value : null;
    const top20Mode = configModeRow ? configModeRow.value : null;
    
    let sortColumn = "pontos";
    if (top20Mode === "vitorias") {
      sortColumn = "vitorias";
    } else if (top20Mode === "level") {
      sortColumn = "level";
    }
    
    const ranking = db.prepare(`SELECT nome, ${sortColumn} as score FROM jogadores ORDER BY ${sortColumn} DESC`).all();
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(ranking.length / itemsPerPage) || 1;

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
        description += `**${overallIndex + 1}.** ${player.nome} ${medal}\n${player.score} ${sortColumn}\n\n`;
      });

      return new EmbedBuilder()
        .setTitle(`Ranking - Página ${page}/${totalPages} (${sortColumn})`)
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

    if (top20ChannelId && interaction.channel.id !== top20ChannelId) {
      try {
        const targetChannel = await client.channels.fetch(top20ChannelId);
        await targetChannel.send({
          embeds: [embed],
          components: [buttons],
        });
        await interaction.reply({ content: `Leaderboard enviada no canal ${targetChannel}.`, ephemeral: true });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erro ao enviar leaderboard no canal configurado.', ephemeral: true });
      }
    } else {
      await interaction.reply({
        embeds: [embed],
        components: [buttons],
      });
    }
  },
};
