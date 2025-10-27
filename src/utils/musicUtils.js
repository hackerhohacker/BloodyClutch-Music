const nodes = [
    {
        name: 'render-internal-node',
        host: '127.0.0.1', // Always use loopback address for internal container communication
        port: 13592,        // Must match application.yml
        auth: 'bloodyclutch123', // Must match application.yml
    },
];

module.exports = {
    nodes,
};
