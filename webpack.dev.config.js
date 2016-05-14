var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

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
      loaders: ["style", "css?sourceMap", "sass?sourceMap"]
    }]
  },
  devServer: {
    contentBase: 'public',
    hot: true,
    inline: true,
    compress: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'WaveGL'
    }),
    new webpack.ProvidePlugin({
      THREE: 'three'
    })
  ],
  devtool: 'inline-source-map'
};
