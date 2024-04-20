import { SlashCommandBuilder } from 'discord.js';
import { JsonDB, Config } from 'node-json-db';

var db = new JsonDB(new Config("data", true, true, '/'));

export const command = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('set the channel where you should receive updates'),
	async execute(interaction) {
        const server = interaction.guild.id;
        const channel = interaction.channel.id;
        db.push('/servers_channels/' + server, channel)
		await interaction.reply({ content: `News feed set to ${server} : ${channel}.`, ephemeral: true });
	},
};
