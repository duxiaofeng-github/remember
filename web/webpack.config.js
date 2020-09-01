const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV;

const isProductionEnv = NODE_ENV === "production";

module.exports = {
  mode: isProductionEnv ? "production" : "development",
  entry: {
    index: path.resolve(__dirname, "./index.tsx"),
  },
  devtool: false,
  output: {
    filename: "[name].[chunkhash:8].js",
    path: path.resolve(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader", // transform es6 to es5
          },
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "./tsconfig.json"),
            },
          },
        ],
      },
      {
        test: /\.(jsx|js)$/,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|ttf|jpg|png|woff|woff2?)(\?.+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "assets/[hash:8].[ext]",
            },
          },
        ],
      },
    ],
  },
  devServer: {
    host: "0.0.0.0",
    port: 10010,
    disableHostCheck: true,
  },
  resolve: {
    extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".web.js", ".js"],
    alias: {
      "react-native$": "react-native-web",
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: isProductionEnv
        ? JSON.stringify("false")
        : JSON.stringify("true"),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../orbit-db-web/orbit-db"),
          to: "orbit-db",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "./index.tpl"),
    }),
  ],
};
