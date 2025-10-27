// This file exports the Lavalink node configuration array.

const nodes = [
    {
        name: 'render-internal-node', 
        host: '127.0.0.1', 
        port: 443, 
        auth: 'bloodyclutch123', 
        secure: false, 
    },
];

// CRITICAL FIX: Only export the nodes array. Kazagumo initialization is moved to index.js.
module.exports = { 
    nodes 
};
