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
      .setColor(0x00AE86)
      .setAuthor({ 
        name: `Pontuação de ${user.username}`, 
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTitle(`Você possui ${pontos} pontos!`)
      .setDescription('Use seus pontos para comprar itens na loja e subir no ranking.')
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: 'Sistema de Pontos', iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
