const path = require('path');

module.exports = (env = {}) => {

    const config = {
        entry: './src/server.ts',
        mode: env.mode || 'production',
        devtool: env.devtool || false,
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'server.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        'ts-loader',
                    ],
                    exclude: /node_modules/,
                }
            ]
        }
    };

    return config;
};
