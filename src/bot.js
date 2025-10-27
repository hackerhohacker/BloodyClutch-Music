const { Client, GatewayIntentBits } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');

// ------------------------------------
// 1. DISCORD CLIENT INITIALIZATION
// ------------------------------------
const client = new Client({
    // CRITICAL: You must enable these intents in the Discord Developer Portal as well.
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // Necessary for many bot commands
    ]
});

// ------------------------------------
// 2. LAVALINK NODE CONFIGURATION (THE FIX!)
// ------------------------------------

// CRITICAL FIX: The nodes must be defined as an ARRAY []
const nodes = [{
    name: 'main-lavalink-node',
    // Use localhost:2333 for Render/Railway private networking with a sidecar
    url: 'localhost:2333',
    // Get this from your Lavalink application's config
    auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass'
}];

// ------------------------------------
// 3. KAZAGUMO (MUSIC CLIENT) INITIALIZATION
// ------------------------------------

// Pass the client options AND the nodes ARRAY
const kazagumo = new Kazagumo(
    {
        defaultSearchEngine: 'youtube', // Default search engine
        // IMPORTANT: Use the correct Connector for your bot library (discord.js)
        // Shoukaku (Kazagumo's core) will handle the voice connection logic
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        plugins: []
    },
    nodes // <--- THIS IS THE CRITICAL FIX: Passing the nodes array
);


// ------------------------------------
// 4. EVENT HANDLERS
// ------------------------------------

// Event for when the bot successfully logs in
client.on('ready', () => {
    // This log confirms the bot has passed the crash point and logged into Discord
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    
    // Initialize Kazagumo after the Discord client is ready
    kazagumo.init(client);
});

// Event for music client ready/error handling (good for debugging)
kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink Node ${name} is ready.`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink Node ${name} error:`, error));

// Example Command Handler (basic command structure)
client.on('messageCreate', async message => {
    // Ignore bot messages and messages without a prefix
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        if (!message.member.voice.channelId) {
            return message.reply('You must be in a voice channel to play music!');
        }

        const query = args.join(' ');
        if (!query) return message.reply('Please provide a song name or URL.');

        let player = kazagumo.players.get(message.guildId);

        // If no player exists, create one and connect to the voice channel
        if (!player) {
            player = await kazagumo.createPlayer({
                guildId: message.guildId,
                voiceId: message.member.voice.channelId,
                textId: message.channelId,
                deaf: true,
            });
        }

        // Search and queue the track
        const result = await kazagumo.search(query, message.author);
        if (!result.tracks.length) return message.reply('No results found.');
