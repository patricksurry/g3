const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
              loader: 'url-loader',
              options: {
                limit: 10000
              }
          }
        ]
      }
    ]
  }
};
