const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    devtool: 'eval-cheap-module-source-map',
    entry: './src/index.ts',
    devServer: {
        port: 8080,
        contentBase: path.join(__dirname, 'dist'),
    },
    node: {
        fs: 'empty',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                },
            },
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'node_modules/react-icons')],
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                },
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            // {
            //     test: /\.(scss|css)$/,
            //     use: [
            //         {
            //             // creates style nodes from JS strings
            //             loader: 'style-loader',
            //             options: {
            //                 sourceMap: true,
            //             },
            //         },
            //         {
            //             // translates CSS into CommonJS
            //             loader: 'css-loader',
            //             options: {
            //                 sourceMap: true,
            //             },
            //         },
            //         // Please note we are not running postcss here
            //     ],
            // },
            {
                // Load all images as base64 encoding if they are smaller than 8192 bytes
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // On development we want to see where the file is coming from, hence we preserve the [path]
                            name: '[path][name].[ext]?hash=[hash:20]',
                            limit: 8192,
                        },
                    },
                ],
            },
            {
                // Load all icons
                test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true,
        }),
        new MiniCssExtractPlugin(),
    ],
};
