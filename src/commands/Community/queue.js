const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Cria um embed de partida")
    .addStringOption((option) =>
      option
        .setName("modo-de-jogo")
        .setDescription("Informe o modo de jogo da partida")
        .setRequired(true)
        .addChoices(
          { name: "Solo", value: "Solo" },
          { name: "Duo", value: "Duo" },
          { name: "Squad", value: "Squad" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Informe o ID da partida.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("canal-de-texto")
        .setDescription("Informe o canal de texto para criação do embed.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
      option
        .setName("senha")
        .setDescription("Informe a senha da partida.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const gamemode = interaction.options.getString("modo-de-jogo");
    const id = interaction.options.getString("id");
    const channel = interaction.options.getChannel("canal-de-texto");
    const password = interaction.options.getString("senha");

    const statusEmbed = new EmbedBuilder()
      .setTitle(`Bloodstrike`)
      .setColor("Red")
      .addFields({ name: "👥 Modo", value: String(gamemode), inline: true })
      .addFields({ name: "🔹ID", value: String(id), inline: true })
      .setImage(
        "https://images-ext-1.discordapp.net/external/gkI84mIwuCiteGsrLSVXRUbcj51T4wRBV_yathCgH8c/https/d1jcobewzbwt6k.cloudfront.net/InHouseQueue_Banner_Static.gif?width=892&height=339"
      )
      .setFooter({ text: "Lobby" })
      .setTimestamp();

    if (password) {
      statusEmbed.addFields({
        name: "🔐Senha",
        value: String(password),
        inline: true,
      });
    }

    const message = await channel.send({ embeds: [statusEmbed] });

    statusEmbed.setFooter({ text: `🎮 ${message.id}` });

    await message.edit({ embeds: [statusEmbed] });

    await interaction.reply({
      content: `✅ Embed enviado com sucesso no canal ${channel}!`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
