const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pause',
    aliases: ['resume'],
    description: 'Pause or resume the current song',
    usage: 'pause',
    voiceChannel: true,
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
        
        const wasPaused = player.paused;
        player.pause(!wasPaused);
        
        const embed = new EmbedBuilder()
            .setColor(wasPaused ? '#00ff00' : '#ffaa00')
            .setTitle(wasPaused ? '▶️ Music Resumed' : '⏸️ Music Paused')
            .setDescription(`${wasPaused ? 'Resumed' : 'Paused'} **${player.current?.title || 'Unknown'}**`)
            .addFields(
                { name: '👤 Action by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};