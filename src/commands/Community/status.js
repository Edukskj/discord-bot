const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Mostra o status do usuário.'),
  async execute(interaction) {
    const user = interaction.user;
    const userId = user.id;

    const row = db.prepare(`
      SELECT * FROM jogadores
      WHERE discord_id = ?
    `).get(userId);

    if (!row) {
      return interaction.reply('Nenhum dado cadastrado para você.');
    }

    const level = row.level ?? 0;
    const partidas = row.partidas ?? 0;
    const kills = row.kills ?? 0;
    const vitorias = row.vitorias ?? 0;
    const winRate = partidas > 0
      ? ((vitorias / partidas) * 100).toFixed(2) + '%'
      : '0%';

    const embed = new EmbedBuilder()
      .setTitle(`Status de ${user.username}`)
      .setColor('Green')
      .addFields(
        { name: 'Level', value: String(level), inline: true },
        { name: 'Partidas', value: String(partidas), inline: true },
        { name: 'Kills', value: String(kills), inline: true },
        { name: '% Win Rate', value: winRate, inline: true },
        { name: 'Vitórias', value: String(vitorias), inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Status' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
