const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

const xpBonusVitoria = 20;

function recalcularLevel(xpAtual, levelAtual) {
  let xpRestante = xpAtual;
  let nivel = levelAtual;
  let xpNecessario = nivel * 100;
  while (xpRestante >= xpNecessario) {
    xpRestante -= xpNecessario;
    nivel++;
    xpNecessario = nivel * 100;
  }
  return { novoXP: xpRestante, novoLevel: nivel };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('win')
    .setDescription('Adiciona vitória(s) a um usuário e atualiza seu XP e nível.')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que venceu')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de vitórias a adicionar (padrão: 1)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const quantia = interaction.options.getInteger('quantidade') || 1;

    const registro = db.prepare(`
      SELECT * FROM jogadores
      WHERE discord_id = ?
    `).get(targetUser.id);

    if (!registro) {
      return interaction.reply(`Nenhum registro encontrado para ${targetUser.username}.`);
    }

    const novasVitorias = (registro.vitorias || 0) + quantia;
    
    const xpAcumulado = (registro.xp || 0) + (xpBonusVitoria * quantia);
    
    const { novoXP, novoLevel } = recalcularLevel(xpAcumulado, registro.level || 1);
    
    const novosPontos = (registro.pontos || 0) + (100 * quantia);

    db.prepare(`
      UPDATE jogadores
      SET vitorias = ?, xp = ?, level = ?, pontos = ?
      WHERE discord_id = ?
    `).run(novasVitorias, novoXP, novoLevel, novosPontos, targetUser.id);

    return interaction.reply(`Vitória(s) adicionada(s) para ${targetUser.username}. Agora ele possui ${novasVitorias} vitórias, ${novoXP} XP acumulado e está no nível ${novoLevel}.`);
  },
};
