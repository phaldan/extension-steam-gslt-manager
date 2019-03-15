const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const ExtensionTarget = require('./ExtensionTarget');

const packageVersion = process.env.npm_package_version;
const packageDesc = process.env.npm_package_description;
const packageTitle = 'Steam GSLT manager';

module.exports = (env, argv) => {
  const prodMode = argv.mode === 'production';
  console.log(`Production mode: ${prodMode ? "enabled" : "disabled"}`);

  const extTarget = new ExtensionTarget(env && env.target ? env.target : undefined);

  return {
    devtool: prodMode ? 'cheap-source-map' : 'inline-cheap-source-map',
    entry: {
      bundle: [
        'babel-polyfill',
        './src/style.less',
        './src/index',
        './src/icon-16.png',
        './src/icon-48.png',
        './src/icon-128.png',
      ],
      background: './src/background',
    },
    output: {
      path: path.resolve(__dirname, `${prodMode ? 'build' : 'dev'}-${extTarget.getTarget()}`),
      filename: '[name].js',
      sourceMapFilename: '[file].map',
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx']
    },
    devServer: {
      historyApiFallback: true,
      inline: false,
      headers: { "Access-Control-Allow-Origin": "*" },
      stats: {
        modules: false,
        chunks: false,
        children: false,
        chunkModules: false,
        hash: false,
      }
    },
    optimization: {
      minimizer: [
        new UglifyJSPlugin({
          parallel: true,
          sourceMap: true,
          test: prodMode ? /\.js$/i : /\.disabled$/i,
        }),
      ],
      splitChunks: {
        chunks: 'all', // Create vendor.js file for ~/node_modules/ folder
      },
    },
    performance: {
      hints: false, // Disable 250 kB size limit per file exceed warning
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.join(__dirname, 'src'),
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: 'awesome-typescript-loader'
            }
          ],
        },
        {
          test: /icon\-(16|48|128)\.png$/,
          loader: 'file-loader?name=[name].[ext]',
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                minimize: prodMode
              }
            },
            {
              loader: "less-loader",
              options: {
                sourceMap: true,
                strictMath: true,
                noIeCompat: true,
                noJs: true,
                noColor: true,
                strictImports: true,
              }
            }
          ]
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader'
        },
        {
          test: /\.(woff|woff2)$/,
          loader: 'url-loader?prefix=font/'
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?mimetype=application/octet-stream'
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?mimetype=image/svg+xml'
        },
        {
          test: /\.hbs$/,
          loader: 'handlebars-loader'
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false, // Required
        template: require('html-webpack-template'),
        appMountId: 'root',
        baseHref: prodMode ? undefined : 'http://localhost:8080/',
        title: packageTitle,
        links: [ 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' ],
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          preserveLineBreaks: prodMode ? true : false
        },
      }),
      new HtmlWebpackPlugin({
        inject: false, // Required
        minify: false,
        template: 'src/manifest.json.hbs',
        filename: 'manifest.json',
        title: packageTitle,
        desc: packageDesc,
        prodMode,
        version: packageVersion,
        enablePersistent: extTarget.isFirefox(),
      }),
      new WriteFilePlugin({
        test: /\.(html|css|js|json|png)$/,
        useHashIndex: true,
      }),
      new MiniCssExtractPlugin({
        filename: 'bundle.css',
      }),
      new ZipPlugin({
        filename: 'steam-gslt-manager.zip',
      }),
      new webpack.DefinePlugin({
        PACKAGE_VERSION: JSON.stringify(packageVersion),
      })
    ],
  }
};
