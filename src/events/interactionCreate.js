const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);

            if (!command) {
                console.error(`❌ No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('❌ Error executing slash command:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Error')
                    .setDescription('There was an error while executing this command!')
                    .setTimestamp();

                const reply = { embeds: [errorEmbed], ephemeral: true };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        }
        
        // Handle button interactions
        else if (interaction.isButton()) {
            const player = interaction.client.kazagumo.players.get(interaction.guildId);
            
            if (!player) {
                return interaction.reply({
                    content: '❌ No music is currently playing!',
                    ephemeral: true
                });
            }

            // Check if user is in the same voice channel
            const memberChannel = interaction.member?.voice?.channel;
            const botChannel = interaction.guild?.members?.me?.voice?.channel;
            
            if (!memberChannel) {
                return interaction.reply({
                    content: '❌ You need to be in a voice channel to use music controls!',
                    ephemeral: true
                });
            }
            
            if (botChannel && memberChannel.id !== botChannel.id) {
                return interaction.reply({
                    content: '❌ You need to be in the same voice channel as the bot!',
                    ephemeral: true
                });
            }

            try {
                switch (interaction.customId) {
                    case 'music_pause':
                        if (player.paused) {
                            player.pause(false);
                            await interaction.reply({ content: '▶️ Resumed the music!', ephemeral: true });
                        } else {
                            player.pause(true);
                            await interaction.reply({ content: '⏸️ Paused the music!', ephemeral: true });
                        }
                        break;
                        
                    case 'music_skip':
                        if (player.queue.length === 0) {
                            player.destroy();
                            await interaction.reply({ content: '⏹️ No more songs in queue. Stopped the player!', ephemeral: true });
                        } else {
                            player.skip();
                            await interaction.reply({ content: '⏭️ Skipped to the next song!', ephemeral: true });
                        }
                        break;
                        
                    case 'music_stop':
                        player.destroy();
                        await interaction.reply({ content: '⏹️ Stopped the music and left the voice channel!', ephemeral: true });
                        break;
                        
                    case 'music_shuffle':
                        if (player.queue.length === 0) {
                            return interaction.reply({ content: '❌ No songs in queue to shuffle!', ephemeral: true });
                        }
                        player.queue.shuffle();
                        await interaction.reply({ content: '🔀 Shuffled the queue!', ephemeral: true });
                        break;
                        
                    case 'music_loop':
                        const loopModes = ['none', 'track', 'queue'];
                        const currentMode = player.loop;
                        const nextModeIndex = (loopModes.indexOf(currentMode) + 1) % loopModes.length;
                        const nextMode = loopModes[nextModeIndex];
                        
                        player.setLoop(nextMode);
                        
                        const loopEmojis = { none: '🔁', track: '🔂', queue: '🔁' };
                        const loopTexts = { none: 'disabled', track: 'current track', queue: 'entire queue' };
                        
                        await interaction.reply({ 
                            content: `${loopEmojis[nextMode]} Loop ${loopTexts[nextMode]}!`, 
                            ephemeral: true 
                        });
                        break;
                }
            } catch (error) {
                console.error('❌ Error handling button interaction:', error);
                await interaction.reply({
                    content: '❌ An error occurred while processing your request!',
                    ephemeral: true
                });
            }
        }
    },
};