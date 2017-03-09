const path = require('path');
const webpack = require("webpack");

module.exports = {
	entry: {
		'tests': './tests/index.ts',
		'sandbox': './tests/sandbox/sandbox.ts',
	},

	output: {
		filename: '[name].bundle.js',
		path: path.join(__dirname, 'compiled/'),
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader',
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		alias: {
			'qunit': 'qunitjs',
		},
		extensions: [".tsx", ".ts", ".js"]
	},
	devtool: 'inline-source-map',
};
