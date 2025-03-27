const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ChannelType, 
  PermissionsBitField 
} = require("discord.js");
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comprar')
    .setDescription('Compra um item da loja usando pontos.')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Nome do item a ser comprado')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade a comprar (para itens de pronta entrega)')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const itemName = interaction.options.getString('item');
    const quantidade = interaction.options.getInteger('quantidade') || 1;

    const jogador = db.prepare("SELECT * FROM jogadores WHERE discord_id = ?").get(userId);
    if (!jogador) {
      return interaction.reply({ content: "Você não possui cadastro na loja.", ephemeral: true });
    }

    const item = db.prepare("SELECT * FROM itens WHERE nome = ?").get(itemName);
    if (!item) {
      return interaction.reply({ content: "Item não encontrado.", ephemeral: true });
    }

    const totalPrice = item.preco * quantidade;
    if (jogador.pontos < totalPrice) {
      return interaction.reply({ content: "Você não tem pontos suficientes para essa compra.", ephemeral: true });
    }

    if (item.tipo === 'pronta_entrega') {
      if (item.estoque < quantidade) {
        return interaction.reply({ content: "Estoque insuficiente para esse item.", ephemeral: true });
      }

      db.prepare("UPDATE jogadores SET pontos = ? WHERE discord_id = ?")
        .run(jogador.pontos - totalPrice, userId);
      db.prepare("UPDATE itens SET estoque = ? WHERE id = ?")
        .run(item.estoque - quantidade, item.id);

      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("Compra Realizada!")
          .setDescription(`Você comprou **${quantidade}x ${item.nome}** por ${totalPrice} pontos.\n\nRecompensa: ${item.recompensa || "Sem recompensa definida."}`)
          .setColor("Green")
          .setTimestamp();
        await interaction.user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.error("Erro ao enviar DM:", error);
      }

      return interaction.reply({ content: `Compra efetuada com sucesso! Verifique suas DMs para a recompensa.`, ephemeral: true });
    }
    else if (item.tipo === 'conversa') {
      db.prepare("UPDATE jogadores SET pontos = ? WHERE discord_id = ?")
        .run(jogador.pontos - totalPrice, userId);
      if (item.estoque > 0) {
        if (item.estoque < quantidade) {
          return interaction.reply({ content: "Estoque insuficiente para esse item.", ephemeral: true });
        }
        db.prepare("UPDATE itens SET estoque = ? WHERE id = ?")
          .run(item.estoque - quantidade, item.id);
      }

      const CONVERSA_CATEGORY_ID = process.env.CONVERSA_CATEGORY_ID;
      const STAFF_CONVERSA_ROLE_ID = process.env.STAFF_CONVERSA_ROLE_ID;

      const channel = await interaction.guild.channels.create({
        name: `compra-${interaction.user.username}-${item.nome}`,
        type: ChannelType.GuildText,
        parent: CONVERSA_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: userId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: STAFF_CONVERSA_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          }
        ],
      });

      const conversaEmbed = new EmbedBuilder()
        .setTitle("Compra de Item - Conversa")
        .setDescription(`O usuário <@${userId}> comprou **${item.nome}** por ${totalPrice} pontos.`)
        .setColor("Orange")
        .setTimestamp();
      
      await channel.send({ embeds: [conversaEmbed] });
      return interaction.reply({ content: `Compra efetuada com sucesso! Um canal foi criado para tratarmos sua compra: ${channel}`, ephemeral: true });
    }
    else {
      return interaction.reply({ content: "Tipo de item desconhecido.", ephemeral: true });
    }
  }
};
