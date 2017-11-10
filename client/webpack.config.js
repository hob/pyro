const HTMLWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSass = new ExtractTextPlugin({
  filename: "[name].[contenthash].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: ['whatwg-fetch', __dirname + '/app/index.js'],
  module: {
    loaders:[
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },{
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [{
          loader: "style-loader"
        },{
          loader: "css-loader" // translates CSS into CommonJS
        },{
          loader: "sass-loader" // compiles Sass to CSS
        }]
      }
    ]
  },
  output: {
    filename: 'pyro.js',
    path: __dirname + '/build'
  },
  plugins: [
    HTMLWebpackPluginConfig,
    extractSass
  ],
  devServer: {
    allowedHosts: [
      "www.pyrodev.com"
    ]
  }
};
