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
            clientId: process.env.CLIENT_ID // Your Discord Bot's Client ID (1363433902940880966)
        };

        // Initialize Lavalink
        this.initializeLavalink();
        
        // Load commands and events
        this.loadCommands();
        this.loadEvents();
    }

    initializeLavalink() {
        const userId = this.config.clientId; // Store for config and logging

        const lavalinkConfig = {
            name: 'main',
            // Read connection details from environment variables
            url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`, 
            host: process.env.LAVALINK_HOST,       
            port: parseInt(process.env.LAVALINK_PORT),      
            auth: process.env.LAVALINK_PASSWORD, // Must be 'bloodyclutch123'
            secure: process.env.LAVALINK_SECURE === 'true', // Must be 'true' for Render's 443 port
            
            // MANDATORY FIX: Pass the Discord Bot's Client ID as the User-Id for Lavalink v4 authentication
            userId: userId,
        };

        const logUrl = `${lavalinkConfig.secure ? 'wss' : 'ws'}://${lavalinkConfig.url}`;
        
        // --- ADDED DEBUGGING LOGS ---
        console.log('--- Lavalink Connection Details ---');
        console.log(`🔗 Target URL: ${logUrl}`);
        console.log(`🔐 Secure: ${lavalinkConfig.secure}`);
        console.log(`🆔 User ID (Bot Client ID): ${lavalinkConfig.userId}`);
        console.log(`🔑 Auth Token Length: ${lavalinkConfig.auth ? lavalinkConfig.auth.length : 0}`);
        console.log('-----------------------------------');
        // -----------------------------

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
