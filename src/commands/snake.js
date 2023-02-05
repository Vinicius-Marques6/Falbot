const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js")
const builder = require("../utils/snake-builder.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("snake")
		.setDescription("Play a game of snake")
		.setDMPermission(false),
	execute: async ({ guild, interaction, instance, user }) => {
		try {
			await interaction.deferReply()
			const author = user
			const game = new builder.Game()

			const embed = new EmbedBuilder()
				.setTitle(":snake:")
				.addFields(
					{
						name: "\u200b",
						value: game.world2string(game.world, game.snake),
					},
					{
						name: `\u200b`,
						value: `:alarm_clock: ${game.time}s\n\n${instance.getMessage(
							guild,
							"SCORE"
						)}: ${game.snake.length}`,
					}
				)
				.setFooter({ text: "by Falcão ❤️" })
				.setColor(10181046)

			const row = new ActionRowBuilder()
			row.addComponents([
				(up = new ButtonBuilder()
					.setCustomId("up")
					.setEmoji("⬆️")
					.setStyle("Secondary")),
				(left = new ButtonBuilder()
					.setCustomId("left")
					.setEmoji("⬅️")
					.setStyle("Secondary")),
				(right = new ButtonBuilder()
					.setCustomId("right")
					.setEmoji("➡️")
					.setStyle("Secondary")),
				(down = new ButtonBuilder()
					.setCustomId("down")
					.setEmoji("⬇️")
					.setStyle("Secondary")),
			])

			var answer = await interaction.editReply({
				embeds: [embed],
				components: [row],
				fetchReply: true,
			})

			const filter = (btInt) => {
				return btInt.user.id === author.id
			}

			const collector = answer.createMessageComponentCollector({
				filter,
				time: 1000 * 60 * 60,
			})

			var myTimer = setInterval(async function () {
				if (game.time <= 0) {
					game.snakeMovement(game.snake, game.Sd)
					game.time = 30
				}

				embed.data.fields[0] = {
					name: "\u200b",
					value: game.world2string(game.world, game.snake),
				}
				embed.data.fields[1] = {
					name: `\u200b`,
					value: `:alarm_clock: ${game.time}s\n\n${instance.getMessage(
						guild,
						"SCORE"
					)}: ${game.snake.length}`,
				}

				await interaction.editReply({
					embeds: [embed],
				})
				game.time -= 5
			}, 1000 * 5)

			collector.on("collect", async (i) => {
				if (i.customId === "up") {
					game.snakeMovement(game.snake, "N")
				} else if (i.customId === "left") {
					game.snakeMovement(game.snake, "W")
				} else if (i.customId === "right") {
					game.snakeMovement(game.snake, "E")
				} else if (i.customId === "down") {
					game.snakeMovement(game.snake, "S")
				}

				embed.data.fields[0] = {
					name: "\u200b",
					value: game.world2string(game.world, game.snake),
				}
				embed.data.fields[1] = {
					name: `\u200b`,
					value: `:alarm_clock: ${game.time}s\n\n${instance.getMessage(
						guild,
						"SCORE"
					)}: ${game.snake.length}`,
				}

				await i.update({
					embeds: [embed],
					components: [row],
				})

				if (game.gameEnded) {
					up.setDisabled(true)
					left.setDisabled(true)
					right.setDisabled(true)
					down.setDisabled(true)
					clearInterval(myTimer)
					collector.stop()

					await interaction.editReply({
						embeds: [embed],
						components: [row],
					})
				}
			})
		} catch (error) {
			console.error(`snake: ${error}`)
			interaction.editReply({
				content: instance.getMessage(guild, "EXCEPTION"),
				embeds: [],
				components: [],
			})
		}
	},
}
