const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

const pontosPorVitoria = 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('incluir')
    .setDescription('Inclui ou atualiza jogadores no banco de dados')
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

      for (const jogador of data) {
        const posicaoNumber = parseInt(jogador.posicao, 10) || 0;
        const vitoriasNovaPartida = (posicaoNumber === 1) ? 1 : 0;
        const pontosGanhos = vitoriasNovaPartida * pontosPorVitoria;

        const existente = db.prepare(`
          SELECT * FROM jogadores
          WHERE discord_id = ?
        `).get(jogador.discord_id);

        if (!existente) {
          db.prepare(`
            INSERT INTO jogadores
              (discord_id, nome, level, partidas, kills, vitorias, posicao, pontos)
            VALUES
              (@discord_id, @nome, @level, @partidas, @kills, @vitorias, @posicao, @pontos)
          `).run({
            discord_id: jogador.discord_id,
            nome: jogador.nome,
            level: jogador.level || 0,
            partidas: jogador.partidas || 1,
            kills: jogador.kills || 0,
            vitorias: vitoriasNovaPartida,
            posicao: posicaoNumber,
            pontos: pontosGanhos
          });
        } else {
          const partidasAtualizadas = (existente.partidas || 0) + 1;
          const killsAtualizadas = (existente.kills || 0) + (jogador.kills || 0);
          const vitoriasAtualizadas = (existente.vitorias || 0) + vitoriasNovaPartida;
          const pontosAtualizados = (existente.pontos || 0) + pontosGanhos;

          const levelAtualizado = jogador.level !== undefined ? jogador.level : existente.level;

          db.prepare(`
            UPDATE jogadores
            SET
              nome = @nome,
              level = @level,
              partidas = @partidas,
              kills = @kills,
              vitorias = @vitorias,
              posicao = @posicao,
              pontos = @pontos
            WHERE discord_id = @discord_id
          `).run({
            discord_id: jogador.discord_id,
            nome: jogador.nome,
            level: levelAtualizado,
            partidas: partidasAtualizadas,
            kills: killsAtualizadas,
            vitorias: vitoriasAtualizadas,
            posicao: posicaoNumber,
            pontos: pontosAtualizados
          });
        }
      }

      await interaction.reply('Dados incluídos ou atualizados com sucesso!');
    } catch (error) {
      console.error(error);
      await interaction.reply('Houve um erro ao processar o JSON.');
    }
  },
};
