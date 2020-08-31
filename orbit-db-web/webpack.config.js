const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const NODE_ENV = process.env.NODE_ENV;

const isProductionEnv = NODE_ENV === "production";

module.exports = {
  mode: isProductionEnv ? "production" : "development",
  entry: {
    index: path.resolve(__dirname, "./index.ts"),
  },
  devtool: false,
  output: {
    filename: "[name].[chunkhash:8].js",
    path: path.resolve(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          configFile: path.resolve(__dirname, "./tsconfig.json"),
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "react-native$": "react-native-web",
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 10020,
    disableHostCheck: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: isProductionEnv
        ? JSON.stringify("false")
        : JSON.stringify("true"),
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "./index.tpl"),
    }),
  ],
};
