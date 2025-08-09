const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode for the music player')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'none' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )),
    
    async execute(interaction) {
        const player = interaction.client.kazagumo.players.get(interaction.guildId);
        const member = interaction.member;
        const loopMode = interaction.options.getString('mode');
        
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
                    .setDescription('❌ You need to be in a voice channel to change loop mode!')],
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
        
        player.setLoop(loopMode);
        
        const loopEmojis = { none: '🔁', track: '🔂', queue: '🔁' };
        const loopTexts = { none: 'disabled', track: 'current track', queue: 'entire queue' };
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`${loopEmojis[loopMode]} Loop Mode Changed`)
            .setDescription(`Loop is now set to **${loopTexts[loopMode]}**`)
            .addFields(
                { name: '👤 Changed by', value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};