const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.join(srcDir, 'popup.tsx'),
    background: path.join(srcDir, 'service-worker.ts'),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== 'background';
      }
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                // css-loader 7 defaults to named exports; the components use
                // `import styles from "./X.module.css"`, so keep the default export.
                namedExport: false,
                exportLocalsConvention: "as-is",
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
              importLoaders: 1,
            },
          },
        ],
        include: path.resolve(__dirname, '../src'),
      },
      // Add a rule for regular CSS files if you need it
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /\.module\.css$/,
      },
    ],

  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{from: ".", to: "../", context: "public"}],
      options: {},
    }),
  ],
};
