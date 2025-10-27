const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');

// Import the synchronized Lavalink node configuration
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

// State to track Lavalink connection status
client.isLavalinkReady = false; 

// --- Lavalink Initialization (FIXED) ---
// The nodes array is correctly inside the options object (1st argument).
client.kazagumo = new Kazagumo({
    defaultSearchEngine: 'youtube',
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    plugins: [],
    // CRITICAL FIX: Nodes are here, preventing the 'not iterable' error.
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


// --- Command and Event Handling ---
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const slashCommandsCommandsPath = path.join(commandsPath, 'slash');
const commandFiles = fs.readdirSync(slashCommandsCommandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(slashCommandsCommandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load events
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

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
