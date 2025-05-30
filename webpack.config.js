const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/background/background.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'background.js'
  },
  resolve: {
    fallback: {
      fs: false, 
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }
    ]
  },
  mode: 'production',
  optimization : {
    minimizer : [
      new TerserPlugin({
        terserOptions : {
          keep_classnames : true
        }
      })
    ]
  }
};
