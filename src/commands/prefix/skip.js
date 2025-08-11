const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    aliases: ['s', 'next'],
    description: 'Skip the current song or skip to a specific position in queue',
    usage: 'skip [position]',
    voiceChannel: true,
    guildOnly: true,
    
    async execute(message, args) {
        const player = message.client.kazagumo.players.get(message.guildId);
        const skipToPosition = args[0] ? parseInt(args[0]) : null;
        
        if (!player || !player.playing) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music is currently playing!')]
            });
        }
        
        const currentTrack = player.current;
        
        if (player.queue.length === 0) {
            if (skipToPosition) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ Queue is empty! Cannot skip to a position.')]
                });
            }
            
            player.destroy();
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00ff00')
                    .setDescription('⏹️ No more songs in queue. Stopped the player!')]
            });
        }
        
        if (skipToPosition) {
            if (isNaN(skipToPosition) || skipToPosition < 1) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ Please provide a valid position number (1 or higher)!')]
                });
            }
            
            if (skipToPosition > player.queue.length) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription(`❌ Invalid position! Queue only has ${player.queue.length} song(s).`)]
                });
            }
            
            const tracksToSkip = skipToPosition - 1;
            const skippedTracks = [];
            
            for (let i = 0; i < tracksToSkip; i++) {
                if (player.queue.length > 0) {
                    skippedTracks.push(player.queue.shift());
                }
            }
            
            player.skip();
            
            const targetTrack = player.queue[0] || player.current;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('⏭️ Skipped to Position')
                .setDescription(`Skipped to position **${skipToPosition}**\nNow playing: **${targetTrack?.title || 'Unknown'}**`)
                .addFields(
                    { name: '🗑️ Tracks Skipped', value: `${tracksToSkip + 1} track(s)`, inline: true },
                    { name: '📋 Queue Remaining', value: `${player.queue.length} song(s)`, inline: true },
                    { name: '👤 Requested by', value: message.author.toString(), inline: true }
                )
                .setTimestamp();
            
            if (targetTrack?.thumbnail) {
                embed.setThumbnail(targetTrack.thumbnail);
            }
            
            return message.reply({ embeds: [embed] });
        }
        
        player.skip();
        
        const nextTrack = player.queue[0];
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⏭️ Song Skipped')
            .setDescription(`Skipped **${currentTrack?.title || 'Unknown'}**${nextTrack ? `\nNow playing: **${nextTrack.title}**` : ''}`)
            .addFields(
                { name: '📋 Queue', value: `${player.queue.length} song(s) remaining`, inline: true },
                { name: '👤 Skipped by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        if (nextTrack?.thumbnail) {
            embed.setThumbnail(nextTrack.thumbnail);
        }
        
        await message.reply({ embeds: [embed] });
    },
};
