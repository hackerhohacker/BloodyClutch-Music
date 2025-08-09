const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shuffle',
    aliases: ['mix'],
    description: 'Shuffle the music queue',
    usage: 'shuffle',
    voiceChannel: true,
    guildOnly: true,
    
    async execute(message) {
        const player = message.client.kazagumo.players.get(message.guildId);
        
        if (!player) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No music player found!')]
            });
        }
        
        if (player.queue.length === 0) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ No songs in queue to shuffle!')]
            });
        }
        
        player.queue.shuffle();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔀 Queue Shuffled')
            .setDescription(`Shuffled **${player.queue.length}** song(s) in the queue`)
            .addFields(
                { name: '👤 Shuffled by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};