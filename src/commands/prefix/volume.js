const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'volume',
    aliases: ['vol', 'v'],
    description: 'Set or check the music volume',
    usage: 'volume [1-100]',
    voiceChannel: true,
    guildOnly: true,
    
    async execute(message, args) {
        const player = message.client.kazagumo.players.get(message.guildId);
        
        if (!player) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music player found!')]
            });
        }
        
        // If no volume level provided, show current volume
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔊 Current Volume')
                .setDescription(`Volume is set to **${player.volume}%**`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        const volumeLevel = parseInt(args[0]);
        
        if (isNaN(volumeLevel) || volumeLevel < 1 || volumeLevel > 100) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Please provide a valid volume level between 1 and 100!')]
            });
        }
        
        const oldVolume = player.volume;
        player.setVolume(volumeLevel);
        
        // Determine volume emoji
        let volumeEmoji = '🔊';
        if (volumeLevel === 0) volumeEmoji = '🔇';
        else if (volumeLevel <= 30) volumeEmoji = '🔉';
        else if (volumeLevel <= 70) volumeEmoji = '🔊';
        else volumeEmoji = '📢';
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`${volumeEmoji} Volume Changed`)
            .setDescription(`Volume changed from **${oldVolume}%** to **${volumeLevel}%**`)
            .addFields(
                { name: '👤 Changed by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};