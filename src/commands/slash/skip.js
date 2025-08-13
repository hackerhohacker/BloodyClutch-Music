const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song or skip to a specific position in queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Queue position to skip to (1 = next song)')
                .setRequired(false)
                .setMinValue(1)
        ),
    
    async execute(interaction) {
        const player = interaction.client.kazagumo.players.get(interaction.guildId);
        const member = interaction.member;
        const skipToPosition = interaction.options.getInteger('position');
        
        if (!player || !player.playing) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music is currently playing!')],
                ephemeral: true
            });
        }
        
        if (!member.voice.channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need to be in a voice channel to skip music!')],
                ephemeral: true
            });
        }
        
        const botChannel = interaction.guild?.members?.me?.voice?.channel;
        if (botChannel && member.voice.channel.id !== botChannel.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need to be in the same voice channel as the bot!')],
                ephemeral: true
            });
        }
        
        const currentTrack = player.current;
        
        if (player.queue.length === 0) {
            if (skipToPosition) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ Queue is empty! Cannot skip to a position.')],
                    ephemeral: true
                });
            }
            
            player.destroy();
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00ff00')
                    .setDescription('⏹️ No more songs in queue. Stopped the player!')]
            });
        }
        
        if (skipToPosition) {
            if (skipToPosition > player.queue.length) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription(`❌ Invalid position! Queue only has ${player.queue.length} song(s).`)],
                    ephemeral: true
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
                    { name: '👤 Requested by', value: interaction.user.toString(), inline: true }
                )
                .setTimestamp();
            
            if (targetTrack?.thumbnail) {
                embed.setThumbnail(targetTrack.thumbnail);
            }
            
            return interaction.reply({ embeds: [embed] });
        }
        
        player.skip();
        
        const nextTrack = player.queue[0];
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⏭️ Song Skipped')
            .setDescription(`Skipped **${currentTrack?.title || 'Unknown'}**${nextTrack ? `\nNow playing: **${nextTrack.title}**` : ''}`)
            .addFields(
                { name: '📋 Queue', value: `${player.queue.length} song(s) remaining`, inline: true },
                { name: '👤 Skipped by', value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();
        
        if (nextTrack?.thumbnail) {
            embed.setThumbnail(nextTrack.thumbnail);
        }
        
        await interaction.reply({ embeds: [embed] });
    },
};
