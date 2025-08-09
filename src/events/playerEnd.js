const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'playerEnd',
    once: false,
    async execute(player, track, reason) {
        const channel = player.client.channels.cache.get(player.textId);
        if (!channel) return;

        // Only send message if the track ended naturally or was skipped
        if (reason === 'FINISHED' || reason === 'LOAD_FAILED') {
            try {
                // If queue is empty and not looping, send goodbye message
                if (player.queue.length === 0 && player.loop === 'none') {
                    const embed = new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setTitle('🎵 Queue Finished')
                        .setDescription('No more songs in queue. Use `/play` to add more music!')
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error('❌ Error sending queue finished message:', error);
            }
        }
    },
};