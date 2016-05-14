var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');

module.exports = {
  context: __dirname + '/public/app',
  entry: './init_app',
  output: {
    path: __dirname + '/dist',
    filename: 'app.js'
  },
  resolve: {
    alias: {
      'three_examples': 'three/examples/js/',
      'css': path.resolve('public/css')
    },
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },
  resolveLoader: {
    root: __dirname + '/node_modules'
  },
  module: {
    preLoaders: [{
      test: /\.ts$/,
      loader: "tslint"
    }],
    loaders: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'awesome-typescript-loader'
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract("style", "css", "sass")
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'WaveGL'
    }),
    new ExtractTextPlugin("styles.css"),
    new webpack.ProvidePlugin({
      THREE: 'three'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true
      }
    })
  ]
};
