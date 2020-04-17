const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/browser/index.js",
  output: {
    // We want to create the JavaScript bundles under a
    // 'static' directory
    filename: "static/[name].[hash].js",
    // Absolute path to the desired output directory. In our
    //case a directory named 'dist'
    // '__dirname' is a Node variable that gives us the absolute
    // path to our current directory. Then with 'path.resolve' we
    // join directories
    // Webpack 4 assumes your output path will be './dist' so you
    // can just leave this
    // entry out.
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localsConvention: "camelCase",
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),

    // Create the stylesheet under 'styles' directory
    new MiniCssExtractPlugin({
      filename: "styles/styles.[hash].css",
    }),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
    }),
  ],
};
