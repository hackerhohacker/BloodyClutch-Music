const nodes = [
    {
        name: 'render-internal-node',
        host: '127.0.0.1', 
        port: 443,        // Must match application.yml
        auth: 'bloodyclutch123', // Must match application.yml
    },
];

module.exports = {
    nodes,
};
