const path = require("path");
const webpack = require("webpack");
const es3ifyPlugin = require("es3ify-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin"); //去除空格
const CopyPlugin = require('copy-webpack-plugin');
var entrys = {
  NBpayment: "./abroad/assets/NB/NBpayment.js",
  NBpaymentApply: "./abroad/assets/NB/NBpaymentApply.js",
  NBpaymentDetail: "./abroad/assets/NB/NBpaymentDetail.js",
  NBstatistics: "./abroad/assets/NB/NBstatistics.js",
}

module.exports = ()=> {

  return {
    entry: {
      NBpayment: "./abroad/assets/NB/NBpayment.js",
      NBpaymentApply: "./abroad/assets/NB/NBpaymentApply.js",
      NBpaymentDetail: "./abroad/assets/NB/NBpaymentDetail.js",
      NBstatistics: "./abroad/assets/NB/NBstatistics.js",
    },

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "assets/NB/[name].js",
    },

    // module: {
    //   rules: [
    //     {
    //       test: /\.css$/,
    //       include: [path.resolve(__dirname, "./layui/css/layui.css")],
    //       use: ["style-loader", "css-loader"],
    //     },
    //   ],
    // },
    mode: "development",
    // devtool:'inline-source-map',
    plugins: [
      new es3ifyPlugin(),
      new CopyPlugin({
        patterns:[
              {from: path.resolve(__dirname, "abroad/layui"), to: 'layui' }, //from 指定 to 输出
              {from: path.resolve(__dirname, "abroad/extends"), to: 'extends' },
              {from: path.resolve(__dirname, "abroad/index.html"), to: 'index.html' },
              {from: path.resolve(__dirname, "abroad/zTreeStyle"), to: 'zTreeStyle' },
              {from: path.resolve(__dirname, "abroad/src/css"), to: 'src/css' },
          ]
      }),
      new HtmlWebpackPlugin({
        filename: "./src/views/NB/NBpayment.html", //输出文件的文件名称
        template: path.resolve(__dirname, "abroad/src/views/NB/NBpayment.html"), //源模板文件
        minify: {
          // 压缩HTML文件
          removeComments: true, // 移除HTML中的注释
          collapseWhitespace: true, // 删除空白符与换行符
        },
        hash: true,
        chunks:['']
      }),

      new HtmlWebpackPlugin({
        filename: "./src/views/NB/NBpaymentApply.html",
        template: path.resolve(__dirname, "abroad/src/views/NB/NBpaymentApply.html"),
        minify: {
          removeComments: true, // 移除HTML中的注释
          collapseWhitespace: true, // 删除空白符与换行符
        },
        hash: true,
        chunks:['']
      }),
      new HtmlWebpackPlugin({
        filename: "./src/views/NB/NBpaymentDetail.html",
        template: path.resolve(__dirname, "abroad/src/views/NB/NBpaymentDetail.html"),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
        },
        hash: true,
        chunks:['']
      }),
      new HtmlWebpackPlugin({
        filename: "./src/views/NB/NBstatistics.html",
        template: path.resolve(__dirname, "abroad/src/views/NB/NBstatistics.html"),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
        },
        hash: true,
        chunks:['']
      }),
      new UglifyJsPlugin({
        //去除空格
        uglifyOptions: {
          mangle: false,
          output: {
            beautify: true,
          },
        },
      }),
    ],
  }
};
