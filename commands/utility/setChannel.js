import { SlashCommandBuilder } from 'discord.js';
import { Store } from 'data-store';
const store = new Store({
	path: process.cwd() + '/data.json'
});

export const command = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('set the channel where you should receive updates'),
	async execute(interaction) {
        const server = interaction.guild.id;
        const channel = interaction.channel.id;
        store.set('servers_channels.' + server, channel)
        store.save()
		await interaction.reply({ content: `News feed set to ${server} : ${channel}.`, ephemeral: true });
	},
};
