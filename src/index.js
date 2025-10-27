const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MusicBot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        // Collections for commands
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        
        // Bot configuration
        this.config = {
            prefix: process.env.PREFIX || '!',
            ownerId: process.env.OWNER_ID,
            clientId: process.env.CLIENT_ID // Your Discord Bot's Client ID
        };

        // Initialize Lavalink
        this.initializeLavalink();
        
        // Load commands and events
        this.loadCommands();
        this.loadEvents();
    }

    initializeLavalink() {
        // --- CRITICAL FIXES: Use Env Vars and Add userId ---
        const lavalinkConfig = {
            name: 'main',
            // 1. Read directly from environment variables (LAVALINK_HOST, PORT, SECURE are now correct on Render)
            url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`, 
            host: process.env.LAVALINK_HOST,       
            port: parseInt(process.env.LAVALINK_PORT),      
            auth: process.env.LAVALINK_PASSWORD,
            secure: process.env.LAVALINK_SECURE === 'true', // Reads the 'true' string and converts to boolean
            
            // 2. MANDATORY FIX: Pass the Discord Bot's Client ID as the User-Id for Lavalink v4 authentication
            userId: this.config.clientId, // Reads the CLIENT_ID from the config object
        };

        const logUrl = `${lavalinkConfig.secure ? 'wss' : 'ws'}://${lavalinkConfig.url}`;

        console.log(`🔗 Connecting to Lavalink: ${logUrl}`);
        console.log(`🔐 Using secure connection: ${lavalinkConfig.secure}`);

        // Added custom Shoukaku options for robustness (keep these)
        const shoukakuOptions = {
            reconnectTries: 30, 
            reconnectInterval: 10000, 
            timeout: 60000, 
            resume: false,
        };
        
        // Ensure Shoukaku knows the user-id from the start using the client's own ID
        this.kazagumo = new Kazagumo({
            defaultSearchEngine: 'youtube',
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
            shoukaku: shoukakuOptions 
        }, new Connectors.DiscordJS(this), [lavalinkConfig]);

        // Lavalink event listeners (keep these the same)
        this.kazagumo.shoukaku.on('ready', (name) => {
            console.log(`✅ Lavalink ${name} is ready!`);
            // Add a check here if the bot is ready to register commands
            if (this.isReady()) {
                this.registerSlashCommands();
            }
        });

        this.kazagumo.shoukaku.on('error', (name, error) => {
            console.error(`❌ Lavalink ${name} error:`, error);
            console.error(`🔍 Check your Lavalink server configuration and ensure it's running`);
        });

        this.kazagumo.shoukaku.on('close', (name, code, reason) => {
            console.log(`🔌 Lavalink ${name} closed with code ${code} and reason ${reason || 'No reason'}`);
            if (code === 1006) {
                console.log(`🔍 Code 1006 usually indicates connection issues. Check your Lavalink server.`);
            }
        });

        this.kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
            if (moved) return;
            console.log(`🔌 Lavalink ${name} disconnected`);
        });

        this.kazagumo.shoukaku.on('reconnecting', (name, reconnectsLeft, reconnectInterval) => {
            console.log(`🔄 Lavalink ${name} reconnecting. ${reconnectsLeft} attempts left, next in ${reconnectInterval}ms`);
        });
    }

    loadCommands() {
        // ... (rest of loadCommands function)
    }

    loadEvents() {
        // ... (rest of loadEvents function)
    }

    async registerSlashCommands() {
        // ... (rest of registerSlashCommands function)
    }

    async start() {
        try {
            await this.login(process.env.DISCORD_TOKEN);
            console.log('🤖 Bot is starting...');
            // Check for command registration on ready event in initializeLavalink
        } catch (error) {
            console.error('❌ Failed to start the bot:', error);
        }
    }
}

/**
 * Standalone function to deploy slash commands globally
 * Usage: node src/index.js --deploy
 */
async function deployCommands() {
    // ... (rest of deployCommands function)
}

// Check if script is run with --deploy flag
if (process.argv.includes('--deploy')) {
    deployCommands();
} else {
    // Create and start the bot
    const bot = new MusicBot();
    bot.start();
}

module.exports = MusicBot;
