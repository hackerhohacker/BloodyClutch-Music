const { EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createMusicButtons } = require('../utils/musicUtils');

module.exports = {
    name: 'playerStart',
    once: false,
    async execute(player, track) {
        const channel = player.client.channels.cache.get(player.textId);
        if (!channel) return;

        try {
            const embed = createNowPlayingEmbed(track, player);
            const buttons = createMusicButtons();

            await channel.send({
                embeds: [embed],
                components: [buttons]
            });
        } catch (error) {
            console.error('❌ Error sending now playing message:', error);
        }
    },
};