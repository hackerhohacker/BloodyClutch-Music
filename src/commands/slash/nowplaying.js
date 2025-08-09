const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createMusicButtons } = require('../../utils/musicUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song'),
    
    async execute(interaction) {
        const player = interaction.client.kazagumo.players.get(interaction.guildId);
        
        if (!player || !player.playing) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music is currently playing!')],
                ephemeral: true
            });
        }
        
        const track = player.current;
        if (!track) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No track information available!')],
                ephemeral: true
            });
        }
        
        const embed = createNowPlayingEmbed(track, player);
        const buttons = createMusicButtons();
        
        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    },
};