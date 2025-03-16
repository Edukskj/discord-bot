const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top-setup')
    .setDescription('Define o canal e o modo de classificação para a tabela de Top-20.')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal onde a tabela será exibida')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('modo')
        .setDescription('Modo de classificação: "vitorias" ou "level"')
        .setRequired(true)
        .addChoices(
          { name: 'Vitórias', value: 'vitorias' },
          { name: 'Level', value: 'level' }
        )
    ),
  async execute(interaction) {

    const canal = interaction.options.getChannel('canal');
    const modo = interaction.options.getString('modo');

    db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    const upsertConfig = (key, value) => {
      const existente = db.prepare("SELECT * FROM config WHERE key = ?").get(key);
      if (existente) {
        db.prepare("UPDATE config SET value = ? WHERE key = ?").run(value, key);
      } else {
        db.prepare("INSERT INTO config (key, value) VALUES (?, ?)").run(key, value);
      }
    };

    upsertConfig('top20_channel', canal.id);
    upsertConfig('top20_mode', modo);

    await interaction.reply(`Configuração atualizada! A tabela de Top-20 será exibida em ${canal} e classificada por ${modo}.`);
  },
};
