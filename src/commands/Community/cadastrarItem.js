const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cadastrar_item')
    .setDescription('Cadastra um item para compra na loja.')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do item')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('descricao')
        .setDescription('Descrição do item')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo do item: Pronta Entrega ou Conversa')
        .setRequired(true)
        .addChoices(
          { name: 'Pronta Entrega', value: 'pronta_entrega' },
          { name: 'Conversa', value: 'conversa' }
        )
    )
    .addIntegerOption(option =>
      option.setName('preco')
        .setDescription('Preço do item')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('estoque')
        .setDescription('Quantidade em estoque (para itens de pronta entrega)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('recompensa')
        .setDescription('Recompensa, ex: código de gift card (para itens de pronta entrega)')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const nome = interaction.options.getString('nome');
    const descricao = interaction.options.getString('descricao');
    const tipo = interaction.options.getString('tipo');
    const preco = interaction.options.getInteger('preco');
    const estoque = interaction.options.getInteger('estoque') || 0;
    const recompensa = interaction.options.getString('recompensa') || null;

    const stmt = db.prepare(`
      INSERT INTO itens (nome, descricao, tipo, preco, estoque, recompensa)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(nome, descricao, tipo, preco, estoque, recompensa);

    return interaction.reply({ content: `Item "${nome}" cadastrado com sucesso!`, ephemeral: true });
  },
};
