var webpack = require('webpack'),
	path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	uglifyJsPlugin = webpack.optimize.UglifyJsPlugin,
	ip = require('ip'),
	CleanPlugin = require('clean-webpack-plugin'),
	config = require('./autopkg/packConfig.js');

console.log("======ip地址========= ：" + ip.address())

// 这个插件不在 Webpack 1.x 中，所以我们需要将这个文件复制到我们的项目里，webpack2.x则不需要
const HashedModuleIdsPlugin = require('./autopkg/HashedModuleIdsPlugin')

module.exports = {
	entry: {
		"babel-polyfill": "babel-polyfill", //用来解决IE9的兼容性
		app: path.resolve(__dirname, config.entry.module + "/app.js"),//项目的入口文件 app.js
		vendor: config.entry.vendor,//公共模块的集合
	},
	output: {
		path: path.resolve(__dirname, config.output.path),
		publicPath: './', //这里必须是反斜杠且devServer.proxy.target必须存在，不然到时候index.html  script src路劲会找不到
		filename: 'assets/js/[name].js',
		chunkFilename: "chunk/[name].chunk.js",
	},
	devServer: {
		inline: true, //设置为true，代码有变化，浏览器端刷新。
		open: true, //:在默认浏览器打开url(webpack-dev-server版本> 2.0)
		port: config.server.port,
		compress: true, //使用gzip压缩
		host: ip.address(),//ip地址，同时也可以设置成是localhost,
		progress: true, //让编译的输出内容带有进度和颜色
		historyApiFallback: true, //回退:支持历史API。
		contentBase: "./", //本地服务器所加载的页面所在的目录
		proxy: {
			'*': {
				target: config.server.target, //跨域Ip地址
				secure: false
			}
		}
	},
	/* 该功能主要是给css 加上前缀，兼容
	 * 暂时不需要，因为加入该插件，会增加很多兼容性的样式，css代码量会成倍的增加
	 */
	/*postcss: [
		require('autoprefixer') //调用autoprefixer插件
	],*/
	resolve: {
		alias: {
			//vue的配置
			'vue': 'vue/dist/vue.min',
			'vue-router': 'vue-router/dist/vue-router.min',
			'vuex': 'vuex/dist/vuex.min',
			
			//react的配置
			'react': 'react/dist/react.min',
			'react-dom': 'react-dom/dist/react-dom.min',
			'redux': 'redux/dist/redux.min',
			'react-redux': 'react-redux/dist/react-redux.min',
		},
		//extensions: ['','.js', '.less', '.css', '.vue', '.jsx'],//1.0的配置
		extensions: ['.js', '.less', '.css', '.vue', '.jsx'],//2.0的配置
		
	},
	externals: {

	},
	module: {
		// 解决动态js url警告错误 2017-05-03
		unknownContextRegExp: /$^/,
		unknownContextCritical: false,

		// require(expr)
		exprContextRegExp: /$^/,
		exprContextCritical: false,

		// require("prefix" + expr + "surfix")
		wrappedContextRegExp: /$^/,
		wrappedContextCritical: false,
		// end
		
		//vue1.0 leader是可以省略的 例如：loader: 'vue',，vue2.0 是不能省略的，例如： 例如：loader: 'vue-loader'
		loaders: [{
			test: /\.vue$/,
			loader: 'vue-loader',
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		}, {
			test: /\.json$/,
			loader: "json-loader"
		}, {
			test: /\.xml$/,
			loader: "xml-loader"
		}, {
			test: /\.(css|less)$/,
			loader: "style-loader!css-loader!less-loader"
		}, {
			test: /\.(png|jpg|jpeg|gif|icon|webp)$/,
			loader: 'url-loader?limit=4192&name=assets/img/[name].[hash:5].[ext]'
		}, {
			test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
			loader: "file-loader?&name=assets/fonts/[name].[ext]"
		}, {
			test: /\.txt$/,
			loader: "text-loader"
		},{
			test: /\.jsx$/,
			exclude: /node_modules/,
			loaders: ['jsx-loader', 'babel-loader']
		}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: config.entry.module + '/index.html'
		}),
		new HashedModuleIdsPlugin(),
		//用于合并代码，分模块更改进行打包优化，也就是说你更改这个模块，只打包这个模块，不影响你的公共文件---begin
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor'
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest',
			chunks: ['vendor'],
		}),
		//----------------------end----------------

		new ExtractTextPlugin("assets/css/[name].[contenthash:5].css", {
			allChunks: false /*是否将分散的css文件合并成一个文件*/
		}),
		new webpack.NoErrorsPlugin() //跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误。
	]
};

if(process.env.NODE_ENV == "prod") {
	//清空输出目录
	module.exports.plugins.push(new CleanPlugin([config.output.path], {
		"root": path.resolve(__dirname, ""),
		verbose: true,
		dry: false
	}));
	//代码压缩
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true
			}
		})
	);

} else {
	//热加载插件
	module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
}