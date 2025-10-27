const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createMusicButtons, isValidUrl } = require('../../utils/musicUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, URL, or search query')
                .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const query = interaction.options.getString('query');
        const member = interaction.member;
        const guild = interaction.guild;
        
        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need to be in a voice channel to play music!')]
            });
        }
        
        // Check bot permissions
        const permissions = member.voice.channel.permissionsFor(guild.members.me);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ I need `Connect` and `Speak` permissions in your voice channel!')]
            });
        }
        
        try {
            // Get or create player
            let player = interaction.client.kazagumo.players.get(guild.id);
            
            if (!player) {
                player = await interaction.client.kazagumo.createPlayer({
                    guildId: guild.id,
                    textId: interaction.channel.id,
                    voiceId: member.voice.channel.id,
                    volume: 80,
                    deaf: true
                });
            }
            
            // Search for tracks
            const searchQuery = isValidUrl(query) ? query : `ytsearch:${query}`;
            const result = await interaction.client.kazagumo.search(searchQuery, {
                requester: interaction.user
            });
            
            if (!result || !result.tracks.length) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ No tracks found for your search!')]
                });
            }
            
            // --- NEW: Sanity Check for Track Playability ---
            if (result.type !== 'PLAYLIST' && !result.tracks[0].isPlayable) {
                console.error('❌ Track is not playable:', result.tracks[0]);
                 return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription(`❌ The track **${result.tracks[0].title}** was found but cannot be played. It might be restricted, private, or require a different source plugin.`)]
                });
            }

            // Handle playlist
            if (result.type === 'PLAYLIST') {
                for (const track of result.tracks) {
                    player.queue.add(track);
                }
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('📋 Playlist Added')
                    .setDescription(`Added **${result.tracks.length}** tracks from **${result.playlistName}**`)
                    .addFields(
                        { name: '📋 Queue Length', value: `${player.queue.length} song(s)`, inline: true },
                        { name: '👤 Requested by', value: interaction.user.toString(), inline: true }
                    )
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
                
                if (!player.playing && !player.paused) {
                    player.play();
                }
                
                return;
            }
            
            // Handle single track
            const track = result.tracks[0];
            
            // If nothing is playing, play immediately
            if (!player.playing && !player.paused && player.queue.length === 0) {
                player.queue.add(track);
                player.play();
                
                const embed = createNowPlayingEmbed(track, player);
                const buttons = createMusicButtons();
                
                await interaction.editReply({
                    embeds: [embed],
                    components: [buttons]
                });
            } else {
                // Add to queue
                player.queue.add(track);
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Added to Queue')
                    .setDescription(`**[${track.title}](${track.uri})**`)
                    .addFields(
                        { name: '👤 Artist', value: track.author || 'Unknown', inline: true },
                        { name: '⏱️ Duration', value: track.length ? `${Math.floor(track.length / 60000)}:${Math.floor((track.length % 60000) / 1000).toString().padStart(2, '0')}` : 'Unknown', inline: true },
                        { name: '📍 Position in Queue', value: `${player.queue.length}`, inline: true },
                        { name: '👤 Requested by', value: interaction.user.toString(), inline: true }
                    )
                    .setTimestamp();
                
                if (track.thumbnail) {
                    embed.setThumbnail(track.thumbnail);
                }
                
                await interaction.editReply({ embeds: [embed] });
            }
            
        } catch (error) {
            console.error('❌ Error in play command:', error);
            
            let errorMessage = '❌ An error occurred while trying to play the track!';

            // Check if the error is a specific Kazagumo/Shoukaku error
            if (error.message && error.message.includes('No node found')) {
                // This shouldn't happen now, but is a good fallback
                errorMessage = '❌ Lavalink connection failed. Please check the bot\'s configuration.';
            } else if (error.message && error.message.includes('403')) {
                // Common error for YouTube rate limits or other permission issues
                 errorMessage = '❌ The music source (YouTube, Spotify, etc.) is currently blocked or rate-limited. Try a different query.';
            } else if (error.message) {
                 // Use the actual error message if it's available and not overly complex
                 errorMessage = `❌ Failed to play track: ${error.message.substring(0, 100)}...`;
            }
            
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(errorMessage)]
            });
        }
    },
};
