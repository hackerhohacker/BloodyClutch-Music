const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),
    
    async execute(interaction) {
        const player = interaction.client.kazagumo.players.get(interaction.guildId);
        const member = interaction.member;
        
        if (!player) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music player found!')],
                ephemeral: true
            });
        }
        
        // Check if user is in voice channel
        if (!member.voice.channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need to be in a voice channel to stop music!')],
                ephemeral: true
            });
        }
        
        // Check if user is in the same voice channel as bot
        const botChannel = interaction.guild?.members?.me?.voice?.channel;
        if (botChannel && member.voice.channel.id !== botChannel.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need to be in the same voice channel as the bot!')],
                ephemeral: true
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
                { name: '👤 Stopped by', value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};