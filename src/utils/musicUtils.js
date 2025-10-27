// This file sets the configuration for the Kazagumo (Lavalink Client) library.
const { Kazagumo } = require('kazagumo');

const nodes = [
    {
        name: 'render-internal-node', 
        // CRITICAL FIX: Internal IP for same-container communication
        host: '127.0.0.1', 
        // CRITICAL FIX: Port must be 443, matching application.yml
        port: 443, 
        // CRITICAL FIX: Password must be 'bloodyclutch123', matching application.yml
        auth: 'bloodyclutch123', 
        // Internal connections are not secure (http)
        secure: false, 
    },
];

const kazagumo = new Kazagumo({
    // ... other options
    nodes: nodes,
});

// Export the nodes array so your index.js can use it
module.exports = { 
    // You may have other utility functions exported here. 
    // Make sure to include all necessary exports.
    nodes 
};
