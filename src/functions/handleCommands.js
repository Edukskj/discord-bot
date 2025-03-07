const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const fs = require("fs");

const clientId = "1346890784867221566";
const guildsId = "";

module.exports = (client) => {
  client.handleCommands = async (commandFolder, path) => {
    client.commandArray = [];
    for (folder of commandFolder) {
      const commandFiles = fs
        .readdirSync(`${path}/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({
      version: "10",
    }).setToken(process.env.BOT_TOKEN);

    (async () => {
      try {
        console.log("Started regreshing application commands. ");
        await rest.put(Routes.applicationCommands(clientId), {
          body: client.commandArray,
        });
        console.log("Successfully reloaded application commands.");
      } catch (error) {
        console.log(error);
      }
    })();
  };
};
