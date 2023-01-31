const { MessageEmbed } = require("discord.js")
const {
	getMember,
	specialArg,
	readFile,
	format,
	randint,
	changeDB,
} = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const { Falbot } = require("../../index.js")

module.exports = {
	description: "Challenge someone to a fight, win the fight and get the money",
	slash: true,
	guildOnly: true,
	testOnly,
	options: [
		{
			name: "user",
			description: "the user to challenge",
			required: true,
			type: "USER",
		},
		{
			name: "falcoins",
			description:
				'the amount of falcoins to bet (supports "all"/"half" and things like 50.000, 20%, 10M, 25B)',
			required: true,
			type: "STRING",
		},
	],
	callback: async ({ guild, interaction, user, member, args }) => {
		await interaction.deferReply()
		try {
			var member2 = await getMember(guild, args[0])
			if (member2.user != user) {
				try {
					var bet = await specialArg(args[1], user.id, "falcoins")
				} catch {
					await interaction.editReply({
						content: Falbot.getMessage(guild, "VALOR_INVALIDO", {
							VALUE: args[1],
						}),
					})
					return
				}
				if (
					(await readFile(user.id, "falcoins")) >= bet &&
					(await readFile(member2.user.id, "falcoins")) >= bet &&
					bet > 0
				) {
					var answer = await interaction.editReply({
						content: Falbot.getMessage(guild, "LUTA_CONVITE", {
							USER: member.displayName,
							USER2: member2.displayName,
							FALCOINS: format(bet),
						}),
						fetchReply: true,
					})
					answer.react("✅")
					answer.react("🚫")

					const filter = (reaction, user) => {
						return user.id === member2.user.id
					}

					const collector = answer.createReactionCollector({
						filter,
						max: 1,
						time: 1000 * 60,
					})

					collector.on("end", async (collected) => {
						if (collected.size === 0) {
							interaction.followUp({
								content: Falbot.getMessage(guild, "LUTA_CANCELADO_DEMOROU", {
									USER: member2,
								}),
							})
						} else if (collected.first()._emoji.name === "🚫") {
							interaction.followUp({
								content: Falbot.getMessage(guild, "LUTA_CANCELADO_RECUSOU", {
									USER: member2,
								}),
							})
						} else {
							await changeDB(user.id, "falcoins", -bet)
							await changeDB(member2.id, "falcoins", -bet)
							const attacks = [
								"instantâneo",
								"stun",
								"roubo de vida",
								"cura",
								"self",
								"escudo",
							]
							const player_1 = {
								hp: 100,
								name: member.displayName,
								stunned: false,
								mention: user,
								id: user.id,
								escudo: false,
							}
							const player_2 = {
								hp: 100,
								name: member2.displayName,
								stunned: false,
								mention: member2,
								id: member2.id,
								escudo: false,
							}
							const luck = Math.round(Math.random())
							if (luck === 0) {
								var order = [player_1, player_2]
							} else {
								var order = [player_2, player_1]
							}

							while (order[0]["hp"] > 0 && order[1]["hp"] > 0) {
								for (let i = 0; i < order.length; i++) {
									if (order[0]["hp"] <= 0 || order[1]["hp"] <= 0) {
										break
									}

									if (order[i]["escudo"] === true) {
										order[i]["escudo"] = false
									}

									const attack = attacks[randint(0, attacks.length - 1)]
									const luck = randint(1, 50)

									if (i === 0) {
										var embed = new MessageEmbed().setColor(3447003)
										var me = 0
										var enemy = 1
									} else {
										var embed = new MessageEmbed().setColor(15105570)
										var me = 1
										var enemy = 0
									}

									field = {
										name: Falbot.getMessage(guild, "TURN", {
											USER: order[i]["name"],
										}),
										value: "",
									}

									if (order[i]["stunned"] === true) {
										order[i]["stunned"] = false
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "NOCAUTEADO")
									} else if (
										order[enemy]["escudo"] === true &&
										!["self", "escudo", "cura"].includes(attack)
									) {
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "TENTOU_ATACAR")
									} else if (attack === "instantâneo") {
										order[enemy]["hp"] -= luck
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "ATAQUE", {
												VALUE: luck,
											})
									} else if (attack === "stun") {
										order[enemy]["hp"] -= luck
										order[enemy]["stunned"] = true
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "ATAQUE_NOCAUTE", {
												VALUE: luck,
											})
									} else if (attack === "roubo de vida") {
										order[enemy]["hp"] -= luck
										order[me]["hp"] += luck
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "ROUBO_VIDA", {
												VALUE: luck,
											})
									} else if (attack === "cura") {
										order[i]["hp"] += luck
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "CURA", {
												VALUE: luck,
											})
									} else if (attack === "self") {
										order[i]["hp"] -= luck
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "SELF", {
												VALUE: luck,
											})
									} else if (attack === "escudo") {
										order[i]["escudo"] = true
										field.value =
											`${order[i]["mention"]} ` +
											Falbot.getMessage(guild, "SE_PROTEGE")
									}

									embed.addFields(field)

									if (order[i]["hp"] > 100) {
										order[i]["hp"] = 100
									}

									embed.addFields({
										name: "HP",
										value: `${order[0]["mention"]}: ${order[0]["hp"]} hp\n${order[1]["mention"]}: ${order[1]["hp"]} hp`,
									})

									await interaction.channel.send({
										embeds: [embed],
									})
									await new Promise((resolve) => setTimeout(resolve, 2500))
								}
							}

							const embed2 = new MessageEmbed()
								.setColor(3066993)
								.setFooter({ text: "by Falcão ❤️" })
							if (order[0]["hp"] <= 0) {
								await changeDB(order[1]["id"], "falcoins", bet * 2)
								await changeDB(order[1]["id"], "vitorias")
								embed2.addFields(
									{
										name:
											`${order[1]["name"]}` + Falbot.getMessage(guild, "GANHO"),
										value: Falbot.getMessage(guild, "LUTA_DERROTOU", {
											USER: order[0]["mention"],
										}),
									},
									{
										name: Falbot.getMessage(guild, "SALDO_ATUAL"),
										value: `${await readFile(
											order[1]["id"],
											"falcoins",
											true
										)} falcoins`,
									}
								)
							} else if (order[1]["hp"] <= 0) {
								await changeDB(order[0]["id"], "falcoins", bet * 2)
								await changeDB(order[0]["id"], "vitorias")
								embed2.addFields(
									{
										name:
											`${order[0]["name"]}` + Falbot.getMessage(guild, "GANHO"),
										value: Falbot.getMessage(guild, "LUTA_DERROTOU", {
											USER: order[1]["mention"],
										}),
									},
									{
										name: Falbot.getMessage(guild, "SALDO_ATUAL"),
										value: `${await readFile(
											order[0]["id"],
											"falcoins",
											true
										)} falcoins`,
									}
								)
							}
							await interaction.channel.send({
								embeds: [embed2],
							})
						}
					})
				} else {
					await interaction.editReply({
						content: Falbot.getMessage(guild, "INSUFICIENTE_CONTAS"),
					})
				}
			} else {
				await interaction.editReply({
					content: Falbot.getMessage(guild, "NAO_JOGAR_SOZINHO"),
				})
			}
		} catch (error) {
			console.error(`fight: ${error}`)
			interaction.channel.send({
				content: Falbot.getMessage(guild, "EXCEPTION"),
				embeds: [],
			})
		}
	},
}
