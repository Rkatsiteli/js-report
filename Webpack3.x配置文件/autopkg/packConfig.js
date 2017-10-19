var isTab = 2; //状态：1=》表示 react 打包  2、表示vue打包公共第三方文件

module.exports = {
	entry: {
		vendor: isTab === 1 ? ['react', 'react-dom', 'react-router', 'redux', 'react-redux'] : ['vue', 'vue-router', 'vuex'],
		module:'./eoiManagement/'//入口文件路劲地址
	},
	output: {
		path: "./eoiManage/" //文件的输出目录
	},
	server: {
		port: 9000, //端口号
		target: 'http://127.0.0.1:80'
	},
}