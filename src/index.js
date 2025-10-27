const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');

// 1. Imports the nodes ARRAY from the utility file
const { nodes } = require('./utils/musicUtils'); 

// Load environment variables (TOKEN, CLIENT_ID, etc.)
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.isLavalinkReady = false; 

// --- Lavalink Initialization: FIX FOR "nodes is not iterable" ---
// This constructor MUST take ONLY 2 arguments total: the options object and the connector.
client.kazagumo = new Kazagumo({
    defaultSearchEngine: 'youtube',
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    plugins: [],
    // CRITICAL FIX: The nodes array is correctly inside the options object.
    nodes: nodes, 
}, new Connectors.DiscordJS(client)); // Connector is the 2nd and final argument.


// --- Lavalink Events ---
client.kazagumo.shoukaku.on('ready', (name) => {
    console.log(`✅ Lavalink Node: ${name} connected successfully.`); 
    client.isLavalinkReady = true;
});

client.kazagumo.shoukaku.on('error', (name, error) => {
    console.error(`❌ Lavalink Node: ${name} encountered an error:`, error.message);
    client.isLavalinkReady = false;
});

client.kazagumo.shoukaku.on('close', (name, code, reason) => {
    console.warn(`🔌 Lavalink Node: ${name} closed. Code: ${code}. Reason: ${reason || 'No reason'}`);
    client.isLavalinkReady = false;
});

client.kazagumo.shoukaku.on('debug', (name, info) => {
    // console.log(`[DEBUG] Lavalink Node: ${name}`, info);
});


// --- Command and Event Handling (Standard Discord.js boilerplate) ---
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const slashCommandsPath = path.join(commandsPath, 'slash');
const commandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(slashCommandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// --- Login to Discord with robust Error Handling ---
try {
    if (!process.env.DISCORD_TOKEN) {
        throw new Error("DISCORD_TOKEN environment variable is not set. Cannot log in.");
    }
    client.login(process.env.DISCORD_TOKEN);
} catch (error) {
    console.error("CRITICAL ERROR: Failed to start Discord Client. Check your DISCORD_TOKEN and bot permissions.");
    console.error(error);
    // Exit clearly to prevent silent failures
    process.exit(1); 
}
