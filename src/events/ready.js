const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🎉 Success! Logged in as ${client.user.tag}`);
        
        // CRITICAL FIX: Initialize Lavalink here, AFTER the bot has logged in,
        // and AFTER the long delay in start.sh has passed.
        client.initializeLavalink();
    },
};
