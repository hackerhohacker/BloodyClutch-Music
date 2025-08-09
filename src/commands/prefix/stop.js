const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stop',
    aliases: ['disconnect', 'dc', 'leave'],
    description: 'Stop the music and clear the queue',
    usage: 'stop',
    voiceChannel: true,
    guildOnly: true,
    
    async execute(message) {
        const player = message.client.kazagumo.players.get(message.guildId);
        
        if (!player) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music player found!')]
            });
        }
        
        const queueLength = player.queue.length;
        const currentTrack = player.current;
        
        player.destroy();
        
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏹️ Music Stopped')
            .setDescription('Stopped the music and cleared the queue')
            .addFields(
                { name: '🎵 Last Track', value: currentTrack?.title || 'None', inline: true },
                { name: '📋 Cleared Queue', value: `${queueLength} song(s)`, inline: true },
                { name: '👤 Stopped by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};