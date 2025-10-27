***

## 4. Discord Bot Logic (`src/index.js`)

This file contains the **final fix for `TypeError: nodes is not iterable`** by ensuring the `Kazagumo` constructor is called with only two arguments.

```javascript:src/index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');

// Imports the nodes ARRAY
const { nodes } = require('./utils/musicUtils'); 

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

// --- Lavalink Initialization (The Critical Fix) ---
client.kazagumo = new Kazagumo({
    defaultSearchEngine: 'youtube',
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    plugins: [],
    // CORRECT: nodes array is inside the options object.
    nodes: nodes, 
}, new Connectors.DiscordJS(client)); // CORRECT: Only 2 arguments total.


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

// --- Command and Event Handling (Simplified for brevity) ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const slashCommandsPath = path.join(commandsPath, 'slash');

// Load commands (assumes necessary files exist)
try {
    const commandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(slashCommandsPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
} catch (e) {
    console.warn("Could not load commands. Ensure 'src/commands/slash' directory exists.");
}

// Load events (assumes necessary files exist)
try {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
} catch (e) {
    console.warn("Could not load events. Ensure 'src/events' directory exists.");
}


// --- Login to Discord with robust Error Handling ---
try {
    if (!process.env.DISCORD_TOKEN) {
        throw new Error("DISCORD_TOKEN environment variable is not set. Cannot log in.");
    }
    client.login(process.env.DISCORD_TOKEN);
} catch (error) {
    console.error("CRITICAL ERROR: Failed to start Discord Client. Check your DISCORD_TOKEN!");
    console.error(error);
    process.exit(1); 
}
