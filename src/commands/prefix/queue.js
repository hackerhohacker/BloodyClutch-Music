const { EmbedBuilder } = require('discord.js');
const { createQueueEmbed } = require('../../utils/musicUtils');

module.exports = {
    name: 'queue',
    aliases: ['q', 'list'],
    description: 'Show the music queue',
    usage: 'queue [page]',
    guildOnly: true,
    
    async execute(message, args) {
        const player = message.client.kazagumo.players.get(message.guildId);
        
        if (!player) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music player found!')]
            });
        }
        
        const page = parseInt(args[0]) - 1 || 0;
        const maxPages = Math.ceil(player.queue.length / 10);
        
        if (page < 0 || (page >= maxPages && player.queue.length > 0)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`❌ Invalid page number! Please choose between 1 and ${maxPages}.`)]
            });
        }
        
        const embed = createQueueEmbed(player, page);
        
        // Add current track info if playing
        if (player.current) {
            embed.addFields({
                name: '🎵 Currently Playing',
                value: `**[${player.current.title}](${player.current.uri})**`,
                inline: false
            });
        }
        
        await message.reply({ embeds: [embed] });
    },
};