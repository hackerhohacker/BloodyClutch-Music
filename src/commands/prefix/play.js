const { EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createMusicButtons } = require('../../utils/musicUtils'); 

// Helper function to validate and clean the URL aggressively
function cleanYoutubeUrl(url) {
    // Check if it's a typical YouTube watch or short link
    if (!url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/')) {
        return url; // Not a YouTube link we need to clean
    }
    
    // 1. Remove parameters that start the 'radio' feature or cause search issues
    let cleanedUrl = url.replace(/(&list=RD.*|&start_radio=1)/g, '');

    try {
        // Use URL object to reliably extract video/playlist ID
        const parsedUrl = new URL(cleanedUrl);
        const videoId = parsedUrl.searchParams.get('v') || parsedUrl.pathname.substring(1);
        const playlistId = parsedUrl.searchParams.get('list');

        if (videoId) {
            // Return only the essential part: https://www.youtube.com/watch?v=VIDEO_ID
            return `https://www.youtube.com/watch?v=${videoId}`;
        } else if (playlistId) {
            // Return the essential playlist part
            return `https://www.youtube.com/playlist?list=${playlistId}`;
        }
        
    } catch (e) {
        // If the URL object fails to parse it, fall back to the cleaned string
        return cleanedUrl; 
    }
    
    return url;
}

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song or playlist',
    usage: 'play <song name or URL>',
    voiceChannel: true,
    guildOnly: true,
    cooldown: 3,
    
    async execute(message, args) {
        if (!args.length) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Please provide a song name or URL!')]
            });
        }
        
        // Use 'let' for the query variable so we can modify it.
        let query = args.join(' '); 
        const member = message.member;
        const guild = message.guild;
        
        // --- FINAL URL CLEANING STEP ---
        // Clean the input, whether it's a URL or a search query
        query = cleanYoutubeUrl(query);
        // --- END CLEANING STEP ---

        // 🚨 CRITICAL FIX: Explicitly prepend 'ytsearch:' if it's not a URL
        const isUrl = query.startsWith('http') || query.startsWith('https');
        const finalQuery = isUrl ? query : `ytsearch:${query}`;

        // Check bot permissions
        const permissions = member.voice.channel.permissionsFor(guild.members.me);
        if (!permissions.has(['Connect', 'Speak'])) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ I need `Connect` and `Speak` permissions in your voice channel!')]
            });
        }
        
        // Send loading message
        const loadingEmbed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setDescription('🔍 Searching for your song...');
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });
        
        try {
            // Get or create player
            let player = message.client.kazagumo.players.get(guild.id);
            
            if (!player) {
                player = await message.client.kazagumo.createPlayer({
                    guildId: guild.id,
                    textId: message.channel.id,
                    voiceId: member.voice.channel.id,
                    volume: 80,
                    deaf: true
                });
            }
            
            // Search using the final, explicitly prefixed query
            const result = await message.client.kazagumo.search(finalQuery, {
                requester: message.author,
                engine: 'youtube' // Keep forcing the engine as a backup
            });
            
            if (!result || !result.tracks.length) {
                return loadingMessage.edit({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ No tracks found for your search! The music server may be having connection issues. Please try a simpler search term.')]
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
                        { name: '👤 Requested by', value: message.author.toString(), inline: true }
                    )
                    .setTimestamp();
                
                await loadingMessage.edit({ embeds: [embed] });
                
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
                
                await loadingMessage.edit({
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
                        { name: '👤 Requested by', value: message.author.toString(), inline: true }
                    )
                    .setTimestamp();
                
                if (track.thumbnail) {
                    embed.setThumbnail(track.thumbnail);
                }
                
                await loadingMessage.edit({ embeds: [embed] });
            }
            
        } catch (error) {
            console.error('❌ Error in play command:', error);
            
            await loadingMessage.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ An error occurred while trying to play the track!')]
            });
        }
    },
};
