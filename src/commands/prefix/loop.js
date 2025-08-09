const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    aliases: ['repeat'],
    description: 'Set loop mode for the music player',
    usage: 'loop [off/track/queue]',
    voiceChannel: true,
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
        
        let loopMode;
        
        if (!args.length) {
            // Cycle through loop modes
            const loopModes = ['none', 'track', 'queue'];
            const currentMode = player.loop;
            const nextModeIndex = (loopModes.indexOf(currentMode) + 1) % loopModes.length;
            loopMode = loopModes[nextModeIndex];
        } else {
            const input = args[0].toLowerCase();
            switch (input) {
                case 'off':
                case 'none':
                case 'disable':
                    loopMode = 'none';
                    break;
                case 'track':
                case 'song':
                case 'current':
                    loopMode = 'track';
                    break;
                case 'queue':
                case 'all':
                    loopMode = 'queue';
                    break;
                default:
                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ Invalid loop mode! Use `off`, `track`, or `queue`.')]
                    });
            }
        }
        
        player.setLoop(loopMode);
        
        const loopEmojis = { none: '🔁', track: '🔂', queue: '🔁' };
        const loopTexts = { none: 'disabled', track: 'current track', queue: 'entire queue' };
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`${loopEmojis[loopMode]} Loop Mode Changed`)
            .setDescription(`Loop is now set to **${loopTexts[loopMode]}**`)
            .addFields(
                { name: '👤 Changed by', value: message.author.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    },
};