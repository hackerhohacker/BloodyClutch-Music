const { Client, GatewayIntentBits } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const express = require('express'); // 1. IMPORT EXPRESS FOR THE RENDER HACK

// ------------------------------------
// 1. DISCORD CLIENT INITIALIZATION
// ------------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ------------------------------------
// 2. LAVALINK NODE CONFIGURATION (The Array Fix)
// ------------------------------------

// CRITICAL FIX: The nodes MUST be defined as an ARRAY []
const nodes = [{
    name: 'main-lavalink-node',
    // Use localhost:2333 for Render/Railway private networking with Lavalink
    url: 'localhost:2333',
    // Uses the LAVALINK_PASSWORD environment variable
    auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
}];

// ------------------------------------
// 3. KAZAGUMO (MUSIC CLIENT) INITIALIZATION
// ------------------------------------

const kazagumo = new Kazagumo(
    {
        defaultSearchEngine: 'youtube',
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        plugins: []
    },
    nodes // <--- PASSING THE CORRECTED ARRAY
);

// ------------------------------------
// 4. EVENT HANDLERS
// ------------------------------------

client.on('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    kazagumo.init(client);
});

kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink Node ${name} is ready.`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink Node ${name} error:`, error));

// Example Command Handler
client.on('messageCreate', async message => {
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

        if (!player) {
            player = await kazagumo.createPlayer({
                guildId: message.guildId,
                voiceId: message.member.voice.channelId,
                textId: message.channelId,
                deaf: true,
            });
        }

        const result = await kazagumo.search(query, message.author);
        if (!result.tracks.length) return message.reply('No results found.');

        player.queue.add(result.tracks[0]);
        message.channel.send(`Queued **${result.tracks[0].title}**.`);

        if (!player.playing && !player.paused) {
            await player.play();
        }
    }
}); 

// ------------------------------------
// 5. BOT LOGIN
// ------------------------------------
client.login(process.env.DISCORD_TOKEN);


// ------------------------------------
// 6. RENDER HEALTH CHECK HACK (REQUIRED FOR WEB SERVICE)
// ------------------------------------
const app = express();
// Render sets the PORT variable, usually 10000
const port = process.env.PORT || 10000;

// Create a minimal web server that responds to health checks
app.get('/', (req, res) => {
    // This simple response satisfies Render's check, keeping the container alive.
    res.send('Discord Bot is running and satisfying Render health checks!');
});

app.listen(port, () => {
    console.log(`Web server running on port ${port} to satisfy Render health check.`);
    // The bot's main process runs concurrently
});
