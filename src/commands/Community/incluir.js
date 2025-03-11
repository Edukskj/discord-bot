const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('incluir')
    .setDescription('Inclui jogadores no banco de dados')
    .addStringOption(option =>
      option.setName('json')
        .setDescription('Array de jogadores em formato JSON')
        .setRequired(true)
    ),
  async execute(interaction) {
    const jsonString = interaction.options.getString('json');

    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) {
        return interaction.reply('O JSON deve ser um array de jogadores.');
      }

      const insert = db.prepare(`
        INSERT INTO jogadores (nome, posicao, kills) 
        VALUES (@nome, @posicao, @kills)
      `);

      for (const jogador of data) {
        insert.run({
          nome: jogador.nome,
          posicao: jogador.posicao,
          kills: jogador.kills
        });
      }

      await interaction.reply('Dados incluídos com sucesso!');
    } catch (error) {
      console.error(error);
      await interaction.reply('Houve um erro ao processar o JSON.');
    }
  },
};
