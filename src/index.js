const {  Client,  GatewayIntentBits,  Collection,  Events,  EmbedBuilder,  ActionRowBuilder,  ButtonBuilder,  ButtonStyle,} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
require("dotenv").config();

const fs = require("fs");

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
  for (const file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.BOT_TOKEN);
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("leaderboard_prev_") || interaction.customId.startsWith("leaderboard_next_")) {
    const ranking = db.prepare("SELECT nome, pontos FROM jogadores ORDER BY pontos DESC").all();
    const itemsPerPage = 10;
    const totalPages = Math.ceil(ranking.length / itemsPerPage);
    const [_, action, currentPageStr] = interaction.customId.split("_");
    let currentPage = parseInt(currentPageStr);

    function generateEmbed(page) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = ranking.slice(startIndex, endIndex);

      let description = "";
      pageItems.forEach((player, index) => {
        const overallIndex = startIndex + index;
        let medal = "";
        switch (overallIndex) {
          case 0:
            medal = "🥇";
            break;
          case 1:
            medal = "🥈";
            break;
          case 2:
            medal = "🥉";
            break;
        }
        description += `**${overallIndex + 1}.** ${player.nome} ${medal}\n${player.pontos} pontos\n\n`;
      });

      return new EmbedBuilder()
        .setTitle(`Ranking - Página ${page}/${totalPages}`)
        .setColor("Blue")
        .setDescription(description)
        .setFooter({ text: "Atualizado agora mesmo" })
        .setTimestamp();
    }

    function generateButtons(page) {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`leaderboard_prev_${page}`)
          .setLabel("Página Anterior")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`leaderboard_next_${page}`)
          .setLabel("Próxima Página")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages)
      );
    }

    if (action === "prev") {
      currentPage--;
    } else if (action === "next") {
      currentPage++;
    }

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const newEmbed = generateEmbed(currentPage);
    const newButtons = generateButtons(currentPage);

    await interaction.update({
      embeds: [newEmbed],
      components: [newButtons],
    });
  }
});