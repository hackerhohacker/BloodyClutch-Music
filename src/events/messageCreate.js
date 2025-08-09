const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;
        
        const prefix = message.client.config.prefix;
        
        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;
        
        // Parse command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Get command from collection
        const command = message.client.prefixCommands.get(commandName);
        
        if (!command) return;
        
        // Check if command is guild only
        if (command.guildOnly && message.channel.type === 'DM') {
            return message.reply('❌ I can\'t execute that command inside DMs!');
        }
        
        // Check permissions
        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return message.reply('❌ You don\'t have permission to use this command!');
            }
        }
        
        // Check if user is in voice channel for music commands
        if (command.voiceChannel) {
            if (!message.member.voice.channel) {
                return message.reply('❌ You need to be in a voice channel to use this command!');
            }
            
            const botChannel = message.guild?.members?.me?.voice?.channel;
            if (botChannel && message.member.voice.channel.id !== botChannel.id) {
                return message.reply('❌ You need to be in the same voice channel as the bot!');
            }
        }
        
        // Check cooldowns
        if (!message.client.cooldowns) message.client.cooldowns = new Map();
        
        const now = Date.now();
        const timestamps = message.client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        
        if (timestamps) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏰ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }
        
        if (!timestamps) {
            message.client.cooldowns.set(command.name, new Map());
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        
        // Execute command
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error('❌ Error executing prefix command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while executing this command!')
                .setTimestamp();
                
            message.reply({ embeds: [errorEmbed] });
        }
    },
};