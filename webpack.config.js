const HtmlWebpackPplugin = require('html-webpack-plugin');
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: './src/chart.js',
  output: {
    filename: 'chart.[hash].js',
    libraryExport: 'default',
    library: 'Chart',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    // httpServer端口
    port: 8080,
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
    new WebpackObfuscator({
      rotateUnicodeArray: true,
      // 压缩代码
      compact: true,
      // 应用概率;在较大的代码库中，建议降低此值，因为大量的控制流转换可能会增加代码的大小并降低代码的速度。
      controlFlowFlatteningThreshold: 1,
      // 随机的死代码块(增加了混淆代码的大小)
      deadCodeInjection: true,
      // 死代码块的影响概率
      deadCodeInjectionThreshold: 1,
      // 此选项几乎不可能使用开发者工具的控制台选项卡
      // debugProtection: true,
      // 如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，从而更难使用“开发人员工具”的其他功能。
      // debugProtectionInterval: 100,
      // 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
      disableConsoleOutput: false,
      // 标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      // 是否启用全局变量和函数名称的混淆
      renameGlobals: false,
      // 通过固定和随机（在代码混淆时生成）的位置移动数组。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
      rotateStringArray: true,
      // 混淆后的代码,不能使用代码美化,同时需要配置 cpmpat:true;
      selfDefending: true,
      // 删除字符串文字并将它们放在一个特殊的数组中
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 1,
      // 允许启用/禁用字符串转换为unicode转义序列。Unicode转义序列大大增加了代码大小，并且可以轻松地将字符串恢复为原始视图。建议仅对小型源代码启用此选项。
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      // 数组内是需要排除的文件
    }, []),
  ],
};
