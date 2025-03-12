const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pontos')
    .setDescription('Mostra a pontuação do usuário.'),
  async execute(interaction) {
    const user = interaction.user;
    const userId = user.id;

    const row = db.prepare(`
      SELECT pontos FROM jogadores
      WHERE discord_id = ?
    `).get(userId);

    if (!row) {
      return interaction.reply('Nenhum dado cadastrado para você.');
    }

    const pontos = row.pontos || 0;

    const embed = new EmbedBuilder()
      .setTitle(`Pontuação de ${user.username}`)
      .setColor('Blue')
      .setDescription(`Você possui ${pontos} pontos.`)
      .setFooter({ text: 'Sistema de Pontos' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
