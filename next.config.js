const path = require('path');

module.exports = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // Example: Add custom aliases
        config.resolve.alias['@components'] = path.join(__dirname, 'components');

        if (!isServer) {
            // Example: Polyfill modules for client-side use
            config.resolve.fallback = { fs: false };
        }

        return config;
    },
};
