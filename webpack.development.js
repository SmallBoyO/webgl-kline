const HtmlWebpackPplugin = require('html-webpack-plugin');
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: './src/chart.js',
  output: {
    filename: 'chart.js',
    libraryExport: 'default',
    library: 'Chart',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    // httpServer端口
    port: 8083,
    hot: false,
  },
  plugins: [
    new HtmlWebpackPplugin({
      // html-webpack-plugin参数配置
      // 指定打包HTML文件参照的模板HTML
      template: './src/index.html',
      // 生成的html文件名称
      filename: 'demo.html',
      // 定义打包的js文件引入在新html的哪个标签里
      inject: 'head',
      scriptLoading: 'blocking',
    }),
  ],
};
