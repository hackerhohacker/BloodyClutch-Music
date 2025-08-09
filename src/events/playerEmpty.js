const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'playerEmpty',
    once: false,
    async execute(player) {
        const channel = player.client.channels.cache.get(player.textId);
        if (!channel) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('👋 Left Voice Channel')
                .setDescription('Left the voice channel due to inactivity.')
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error sending player empty message:', error);
        }

        // Destroy the player
        player.destroy();
    },
};