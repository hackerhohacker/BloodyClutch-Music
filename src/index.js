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
            clientId: process.env.CLIENT_ID
        };

        // Initialize Lavalink
        this.initializeLavalink();
        
        // Load commands and events
        this.loadCommands();
        this.loadEvents();
    }

    initializeLavalink() {
        // Since the server logs indicate Lavalink is starting on 8080, we will target that port 
        // to ensure a successful connection.
        const lavalinkConfig = {
            name: 'main',
            
            // FIX: Targeting the confirmed Lavalink port 8080
            url: '127.0.0.1:8080', // Shoukaku expects 'url' as host:port
            host: '127.0.0.1',      // Internal Loopback Address
            port: 8080,             // CHANGED from 443 back to 8080
            
            // Keep reading the password from the environment, as it's a secret
            auth: process.env.LAVALINK_PASSWORD,
            
            // FIX: Internal connections are NOT secure (no SSL/TLS)
            secure: false
        };

        // For console logging, we display the full URL with protocol
        const logUrl = `${lavalinkConfig.secure ? 'wss' : 'ws'}://${lavalinkConfig.url}`;

        console.log(`🔗 Connecting to Lavalink: ${logUrl}`);
        console.log(`🔐 Using secure connection: ${lavalinkConfig.secure}`);

        // The correct array structure for the final argument
        this.kazagumo = new Kazagumo({
            defaultSearchEngine: 'youtube',
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            }
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
        // Load slash commands
        const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
        if (fs.existsSync(slashCommandsPath)) {
            const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of slashCommandFiles) {
                const filePath = path.join(slashCommandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    this.slashCommands.set(command.data.name, command);
                    console.log(`📁 Loaded slash command: ${command.data.name}`);
                } else {
                    console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        // Load prefix commands
        const prefixCommandsPath = path.join(__dirname, 'commands', 'prefix');
        if (fs.existsSync(prefixCommandsPath)) {
            const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of prefixCommandFiles) {
                const filePath = path.join(prefixCommandsPath, file);
                const command = require(filePath);
                
                if ('name' in command && 'execute' in command) {
                    this.prefixCommands.set(command.name, command);
                    if (command.aliases) {
                        command.aliases.forEach(alias => {
                            this.prefixCommands.set(alias, command);
                        });
                    }
                    console.log(`📁 Loaded prefix command: ${command.name}`);
                } else {
                    console.log(`⚠️ The command at ${filePath} is missing a required "name" or "execute" property.`);
                }
            }
        }
    }

    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        if (fs.existsSync(eventsPath)) {
            const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
            
            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);
                
                if (event.once) {
                    this.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`📁 Loaded event: ${event.name}`);
            }
        }
    }

    async registerSlashCommands() {
        if (!this.config.clientId) {
            console.error('❌ CLIENT_ID is required to register slash commands!');
            return;
        }

        const commands = [];
        this.slashCommands.forEach(command => {
            commands.push(command.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            console.log('🔄 Started refreshing application (/) commands globally...');

            await rest.put(
                Routes.applicationCommands(this.config.clientId),
                { body: commands }
            );

            console.log(`✅ Successfully registered ${commands.length} application (/) commands globally.`);
            console.log('⏰ Global commands may take up to 1 hour to appear in all servers.');
        } catch (error) {
            console.error('❌ Error registering slash commands:', error);
        }
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
    const commands = [];
    
    // Load all slash commands
    const commandsPath = path.join(__dirname, 'commands', 'slash');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`📁 Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    if (!process.env.CLIENT_ID) {
        console.error('❌ CLIENT_ID is required to deploy slash commands!');
        process.exit(1);
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands globally.`);

        // The put method is used to fully refresh all commands globally
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('⏰ Global commands may take up to 1 hour to appear in all servers.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        process.exit(1);
    }
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
