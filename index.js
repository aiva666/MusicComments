let beginTime = new Date().getTime()	// 程序开始执行的时间
const Axios = require('axios')			// 引入axios
const config = require('./config')		// 导入配置文件
const fs = require('fs')				// 导入fs模块

Axios.defaults.baseURL = 'http://127.0.0.1:3000'  // 设置默认根路径


const id = config.songId;		// 歌曲ID
const userName = config.userName	// 用户名

const limit = 20;	// 每页评论数量

let page = 1;		// 页码
let lastTime = 0;	// 用来记录最后一个评论的Time值

getComm()
function getComm() {
	let url;
	// 大于5000条数据时添加before参数，值为上一页最后一个评论的time
	if (page >= 52) {
		url = `/comment/music?id=${id}&before=${lastTime}&limit=${limit}&offset=${(page-1)*20}`
	}else {
		url = `/comment/music?id=${id}&limit=${limit}&offset=${(page-1)*20}`
	}

	console.log(`正在获取第${page}页数据`)

	// 发起请求
	Axios({
		method:'get',
		url,
	}).then(res => {
		if (res.status == 200) {
			// 如果响应参数的more属性为false,退出程序
			if (!res.data.more) {
				let n = new Date().getTime();		// 当前时间，减去程序开始执行的时间除以1000得出程序执行的秒数
				console.log(`评论爬取完毕，用时${parseInt((n-beginTime)/1000)}秒,程序退出！`)
				process.exit();
			}
			let comms = res.data.comments;
			// 遍历响应的评论数组
			comms.forEach((item,index) => {
				// 如果item的user.nickname属性等于用户名输出到文件中
				if (item.user.nickname == userName) {
					let str =`${new Date(item.time).toLocaleString()}\r\n------${userName}说： ${item.content}\r\n\r\n`
					// 利用fs写入文件
					fs.writeFile(`./${userName}的评论.txt`,str,{flag:'a'},(err) => {
						if (err) {
							console.log('已找到评论，但是写入文件失败')
						}
						console.log(`在第${page}页找到评论，已写入文件`)
					})
				}
				// 页数大于等于51时设置lastTime等于最后一个评论的time
				if (page >= 51 && index == limit-1) {
					lastTime = item.time;
					console.log('当前页最后一条评论时间：' + new Date(item.time).toLocaleString())
				}
			})

			// 如果页数大于51让page++
			page ++;

			// 递归，继续执行函数
			getComm()
		}
	}).catch(err => {
		console.log(err)
	})
}




