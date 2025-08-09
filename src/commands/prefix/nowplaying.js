const { EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createMusicButtons } = require('../../utils/musicUtils');

module.exports = {
    name: 'nowplaying',
    aliases: ['np', 'current'],
    description: 'Show information about the currently playing song',
    usage: 'nowplaying',
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
        
        const track = player.current;
        if (!track) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No track information available!')]
            });
        }
        
        const embed = createNowPlayingEmbed(track, player);
        const buttons = createMusicButtons();
        
        await message.reply({
            embeds: [embed],
            components: [buttons]
        });
    },
};