const webpack = require('webpack');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const skipDashboard = process.env.SKIP_DASHBOARD;
const distPath = path.resolve(__dirname, 'dist');

module.exports = {
  entry: './test.js',
  output: {
    path: distPath,
    filename: '[name].js'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    alias: {
      coalesce: path.resolve(__dirname, 'src'),
      'coalesce-tests': path.resolve(__dirname, 'tests'),
      mocha$: path.resolve(__dirname, 'node_modules/mocha/mocha.js'),
      'mocha-lazy-bdd$': path.resolve(__dirname, 'node_modules/mocha-lazy-bdd/dist/mocha-lazy-bdd.js')
    }
  },
  target: 'web',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'test.html',
      path: distPath,
      filename: 'test.html'
    })
  ].concat(skipDashboard ? [] : [new DashboardPlugin({ port: 9840 })])
};
