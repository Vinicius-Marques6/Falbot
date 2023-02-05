const { EmbedBuilder } = require("discord.js")
const { msToTime } = require("../utils/functions.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Check some bot stats")
		.setDMPermission(false),
	execute: async ({ guild, client, interaction, instance }) => {
		await interaction.deferReply()
		try {
			const embed = new EmbedBuilder()
				.setColor(3426654)
				.addFields({
					name: "Falbot info",
					value: `**:earth_americas: Site: https://falbot.netlify.app/\n:robot: Github: https://github.com/falcao-g/Falbot\n:bird: Twitter: https://twitter.com/falb0t\n:house: ${Falbot.getMessage(
						guild,
						"SERVERS"
					)}: ${
						client.guilds.cache.size
					}\n:busts_in_silhouette: ${instance.getMessage(guild, "PLAYERS")}: ${
						(await instance.userSchema.find({})).length
					}\n:zap: ${instance.getMessage(guild, "UPTIME")}: ${msToTime(
						client.uptime
					)}**`,
				})
				.setFooter({ text: "by Falcão ❤️" })
			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			console.error(`botinfo: ${error}`)
			interaction.editReply({
				content: instance.getMessage(guild, "EXCEPTION"),
				embeds: [],
			})
		}
	},
}
