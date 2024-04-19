import * as fs from 'fs';
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();
const clientId = process.env.APP_ID;
const token = process.env.DISCORD_TOKEN;
const publicKey = process.env.PUBLIC_KEY;

const commands = [];

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const com = await import(`#commands/${folder}/${file}`);
		const command = com.command
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at commands/${folder}/${file} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();