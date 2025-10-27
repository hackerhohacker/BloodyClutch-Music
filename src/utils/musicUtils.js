---

## 3. Lavalink Node Configuration (`src/utils/musicUtils.js`)

This file defines the connection details your bot uses. It uses the loopback address (`127.0.0.1`) and the fixed port (`443`).

```javascript:src/utils/musicUtils.js
const nodes = [
    {
        name: 'render-internal-node',
        host: '127.0.0.1', // Always use loopback address for internal container communication
        port: 443,        // Must match application.yml
        auth: 'bloodyclutch123', // Must match application.yml
    },
];

module.exports = {
    nodes,
};
