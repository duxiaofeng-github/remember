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
    path: path.resolve(__dirname, "./orbit-db"),
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
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
        test: /\.(js)$/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
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
