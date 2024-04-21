import { SlashCommandBuilder } from 'discord.js';
import { getAssignement } from '../../utilities/hellbot-utility.js'

export const command = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('majororder')
		.setDescription('Provides information about the current major order.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		const assignement = await getAssignement();
		await interaction.reply(assignement);
	},
};
