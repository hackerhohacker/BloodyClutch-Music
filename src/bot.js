const { Client, GatewayIntentBits } = require('discord.js');
const { Kazagumo } = require('kazagumo');

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
// 2. LAVALINK NODE CONFIGURATION (THE FIX!)
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
        // Shoukaku/Kazagumo requires a 'send' function to communicate Discord voice updates
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

// Confirms Discord connection and initializes Kazagumo
client.on('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    kazagumo.init(client);
});

// Lavalink connection status logging (for debugging)
kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink Node ${name} is ready.`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink Node ${name} error:`, error));

// Example Command Handler
client.on('messageCreate', async message => {
    // Basic prefix command check
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
}); // <--- FINAL CLOSING BRACKETS for the event handler

// ------------------------------------
// 5. BOT LOGIN (THE ABSOLUTE LAST LINE)
// ------------------------------------
client.login(process.env.DISCORD_TOKEN);
