var webpack = require('webpack');
var CommonsPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');

module.exports = {
    entry: {
        'main': './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: ""
    },
    plugins: [
        new webpack.ProvidePlugin({
            'Vue': 'vue',
            'd3': 'd3'
        }),
        new ExtractTextPlugin('[name].css'),
        new CommonsPlugin('common.js'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            inject: true,
            hash: true
        })
    ],
    module: {
        loaders: [
            {test: /\.vue$/, loader: 'vue-loader'},
            {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
            {test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader'}
        ]
    },
    vue: {
        loaders: {
            css: ExtractTextPlugin.extract('vue-style-loader', 'css')
        }
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.js'
        }
    }
};