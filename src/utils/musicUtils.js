// This file sets the configuration for the Lavalink client nodes.

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

// Export the nodes array so your index.js can use it
module.exports = { 
    // You may have other utility functions exported here. 
    // Make sure to include all necessary exports.
    nodes 
};
