const path = require('path');

module.exports = {
    // Ensure the application runs with the default Node.js server runtime.
    // The project depends on API routes and getServerSideProps, which are
    // incompatible with Next.js' static export mode. Explicitly opting into
    // the standalone output avoids Next trying to statically export the app
    // when running in development or production.
    output: 'standalone',
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
