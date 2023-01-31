const help = require("../commands/help")

module.exports = (client) => {
	client.on("interactionCreate", async (interaction) => {
		try {
			if (!interaction.isSelectMenu()) return

			if (interaction.customId === "page") {
				guild = interaction.member.guild
				await help.callback({ guild, interaction })
			}
		} catch (error) {
			console.error(`Select: ${error}`)
			interaction.editReply({
				content: Falbot.getMessage(guild, "EXCEPTION"),
			})
		}
	})
}
