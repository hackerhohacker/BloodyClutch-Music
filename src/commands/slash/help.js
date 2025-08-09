const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Music Bot Commands')
            .setDescription('Here are all the available commands for the music bot:')
            .addFields(
                {
                    name: '🎵 Music Commands (Slash)',
                    value: [
                        '`/play <query>` - Play a song or playlist',
                        '`/pause` - Pause or resume the current song',
                        '`/skip` - Skip the current song',
                        '`/stop` - Stop music and clear queue',
                        '`/nowplaying` - Show current song info',
                        '`/queue [page]` - Show the music queue',
                        '`/volume [level]` - Set or check volume (1-100)',
                        '`/loop <mode>` - Set loop mode (off/track/queue)',
                        '`/shuffle` - Shuffle the queue'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎵 Music Commands (Prefix)',
                    value: [
                        '`!play <query>` - Play a song or playlist',
                        '`!pause` - Pause or resume the current song',
                        '`!skip` - Skip the current song',
                        '`!stop` - Stop music and clear queue',
                        '`!np` - Show current song info',
                        '`!queue [page]` - Show the music queue',
                        '`!volume [level]` - Set or check volume',
                        '`!loop [mode]` - Set loop mode',
                        '`!shuffle` - Shuffle the queue'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎛️ Music Controls',
                    value: 'Use the buttons below music messages for quick controls:\n⏸️ Pause/Resume | ⏭️ Skip | ⏹️ Stop | 🔀 Shuffle | 🔁 Loop',
                    inline: false
                },
                {
                    name: '📋 Supported Sources',
                    value: '• YouTube\n• YouTube Music\n• Spotify (tracks only)\n• SoundCloud\n• Direct URLs',
                    inline: false
                }
            )
            .setFooter({
                text: `Prefix: ${interaction.client.config.prefix} | Use slash commands (/) for better experience!`
            })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};