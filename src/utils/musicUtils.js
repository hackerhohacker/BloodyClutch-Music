const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Formats duration from milliseconds to MM:SS or HH:MM:SS format
 * @param {number} duration - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(duration) {
    if (!duration || duration === 0) return '00:00';
    
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Creates a progress bar for the current track
 * @param {number} current - Current position in milliseconds
 * @param {number} total - Total duration in milliseconds
 * @param {number} length - Length of the progress bar (default: 20)
 * @returns {string} Progress bar string
 */
function createProgressBar(current, total, length = 20) {
    if (!total || total === 0) return '▬'.repeat(length);
    
    const progress = Math.round((current / total) * length);
    const emptyProgress = length - progress;
    
    const progressText = '▬'.repeat(progress);
    const emptyProgressText = '▬'.repeat(emptyProgress);
    
    return progressText + '🔘' + emptyProgressText;
}

/**
 * Creates a now playing embed
 * @param {Object} track - The current track
 * @param {Object} player - The music player
 * @returns {EmbedBuilder} The embed object
 */
function createNowPlayingEmbed(track, player) {
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎵 Now Playing')
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
            { name: '👤 Artist', value: track.author || 'Unknown', inline: true },
            { name: '⏱️ Duration', value: formatDuration(track.length), inline: true },
            { name: '🔊 Volume', value: `${player.volume}%`, inline: true },
            { name: '🔁 Loop', value: player.loop === 'none' ? 'Disabled' : player.loop === 'track' ? 'Track' : 'Queue', inline: true },
            { name: '📋 Queue', value: `${player.queue.length} song(s)`, inline: true },
            { name: '⏸️ Status', value: player.paused ? 'Paused' : 'Playing', inline: true }
        )
        .setTimestamp();
    
    if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }
    
    // Add progress bar if track is playing
    if (player.position && track.length) {
        const progressBar = createProgressBar(player.position, track.length);
        embed.addFields({
            name: '⏯️ Progress',
            value: `${formatDuration(player.position)} ${progressBar} ${formatDuration(track.length)}`,
            inline: false
        });
    }
    
    return embed;
}

/**
 * Creates music control buttons
 * @returns {ActionRowBuilder} The action row with buttons
 */
function createMusicButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setEmoji('⏸️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_stop')
                .setEmoji('⏹️')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('music_shuffle')
                .setEmoji('🔀')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_loop')
                .setEmoji('🔁')
                .setStyle(ButtonStyle.Secondary)
        );
}

/**
 * Creates a queue embed showing upcoming tracks
 * @param {Object} player - The music player
 * @param {number} page - Current page (default: 0)
 * @returns {EmbedBuilder} The embed object
 */
function createQueueEmbed(player, page = 0) {
    const queue = player.queue;
    const tracksPerPage = 10;
    const start = page * tracksPerPage;
    const end = start + tracksPerPage;
    const tracks = queue.slice(start, end);
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Music Queue')
        .setTimestamp();
    
    if (queue.length === 0) {
        embed.setDescription('The queue is empty!');
        return embed;
    }
    
    let description = '';
    tracks.forEach((track, index) => {
        const position = start + index + 1;
        description += `**${position}.** [${track.title}](${track.uri}) - \`${formatDuration(track.length)}\`\n`;
    });
    
    embed.setDescription(description);
    
    const totalPages = Math.ceil(queue.length / tracksPerPage);
    embed.setFooter({
        text: `Page ${page + 1} of ${totalPages} • ${queue.length} song(s) in queue`
    });
    
    return embed;
}

/**
 * Validates if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} Whether the string is a valid URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
function truncateText(text, length = 50) {
    if (text.length <= length) return text;
    return text.substring(0, length - 3) + '...';
}

module.exports = {
    formatDuration,
    createProgressBar,
    createNowPlayingEmbed,
    createMusicButtons,
    createQueueEmbed,
    isValidUrl,
    truncateText
};