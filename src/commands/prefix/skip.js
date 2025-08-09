const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    aliases: ['s', 'next'],
    description: 'Skip the current song',
    usage: 'skip',
    voiceChannel: true,
    guildOnly: true,
    
    async execute(message) {
        const player = message.client.kazagumo.players.get(message.guildId);
        
        if (!player || !player.playing) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music is currently playing!')]
            });
        }
        
        const currentTrack = player.current;
        
        if (player.queue.length === 0) {
            player.destroy();
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00ff00')
                    .setDescription('⏹️ No more songs in queue. Stopped the player!')]
            });
        }
        
        player.skip();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⏭️ Song Skipped')
            .setDescription(`Skipped **${currentTrack?.title || 'Unknown'}**`)
            .addFields(
                { name: '📋 Queue', value: `${player.queue.length} song(s) remaining`, inline: true },
                { name: '👤 Skipped by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};