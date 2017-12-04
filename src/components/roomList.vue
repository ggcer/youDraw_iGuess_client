<template>
  <el-container v-show="username != null && username != ''">
		<el-aside width="350px">
			<div class="about-user">
				<img src="../assets/images/init-avatar.jpg" class="user-avator">
				<p>{{username}}</p>
				<el-button type="text" class="button" @click="loginOut" style="font-size: 15px;">退出</el-button>
			</div>
		</el-aside>
		<el-main style="position: relative;">
			<el-tabs v-model="tabRoomType" @tab-click="changeTab">
		    <el-tab-pane label="全部房间" name="allRoom">
		    	<el-row :gutter="20">
						  <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2" v-for="(item, index) in roomList" :key="item.username" v-if="!item.isClosed" style="margin-bottom: 20px;">
						  	<el-card style="position: relative;">
						  		<img src="../assets/images/init-avatar.jpg" class="room-avator" @click="intoRoom(item.roomId, item.roomName)">
						  		<p class="room-name">{{item.roomName}}</p>
						  		<p class="room-desc">{{item.roomDesc}}</p>
						  		<p class="room-creator"><span>By</span>{{item.roomCreator}}</p>
						  		<div class="room-user-count"><i class="el-icon-edit"></i>{{item.userList.length}}</div>
						  	</el-card>
						  </el-col>
					</el-row>
		    </el-tab-pane>
		    <el-tab-pane label="我的房间" name="myRoom">
		    	<el-row :gutter="20">
						  <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2" v-for="(item, index) in myRoomList" :key="item.username" v-if="!item.isClosed" style="margin-bottom: 20px;">
						  	<el-card style="position: relative;">
						  		<img src="../assets/images/init-avatar.jpg" class="room-avator" @click="intoRoom(item.roomId, item.roomName)">
						  		<p class="room-name">{{item.roomName}}</p>
						  		<p class="room-desc">{{item.roomDesc}}</p>
						  		<p class="room-creator"><span>By</span>{{item.roomCreator}}</p>
						  		<div class="room-user-count"><i class="el-icon-edit"></i>{{item.userList.length}}</div>
						  	</el-card>
						  </el-col>
					</el-row>
		    </el-tab-pane>
		  </el-tabs>
		  <el-button type="primary" round class="add-btn" @click="showCreateRoomDialog = true">新 建 房 间</el-button>
			
			<el-dialog title="新 建 房 间" :visible.sync="showCreateRoomDialog" width="30%">
			  <el-form :model="createRoomMsg" label-width="80px" size="mini">
			    <el-form-item label="房间名称">
			      <el-input v-model="createRoomMsg.roomName" auto-complete="off"></el-input>
			    </el-form-item>
			    <el-form-item label="房间描述">
			    	<el-input v-model="createRoomMsg.roomDesc" auto-complete="off"></el-input>
			    </el-form-item>
			  </el-form>
			  <div slot="footer" class="dialog-footer">
			    <el-button type="primary" round @click="createRoom(1)">新 建 房 间</el-button>
			    <el-button round @click="createRoom(2)">快 速  建 一 个</el-button>
			  </div>
			</el-dialog>
			
		</el-main>
	</el-container>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
export default {
  name: 'room',
  data() {
    return {
    	username: null,
    	roomList: [],
    	
    	tabRoomType: 'allRoom',
    	showCreateRoomDialog: false,
    	createRoomMsg: {
    		roomName: null,
    		roomDesc: null
    	},
    	loginMsg: {
    		username: null,
    	},
    	
    	ws: null,
    	common: Vue.prototype.common
    }
  },
  methods: {
		changeTab(tab, event) {
			console.log(tab, event);
		},
		
		//登录并设置cookie
		loginByAxios() {
			axios({
				url: '/server/login',
			  method: 'post',
			  dataType: 'json',
			  data: {
			    username: this.loginMsg.username,
			  }
			}).then((res) => {
		    let data = res.data;
		    console.log(data);
		    if(data.status == 1){
		    	this.loginMsg.username = null;
					this.username = data.content.username;
					this.$message({
	          message: '登录成功',
	          duration: 2000,
	          type: 'success'
	        });
					//打开websocket连接
					this.openWs();
				}else{
					this.$message.error(data.desc);
				}
		  })
		  .catch((error) => {
		    this.$message.error(error);
		  });
		},
		
		//登出并清除cookie
		loginOut() {
			this.common.clearCookie('username');
			window.location.reload();
		},
		
		createRoom(type) {
			if(type == 1) {
				if(this.createRoomMsg.roomName == null || this.createRoomMsg.roomName == ''){
					this.$message({
	          message: '房间名称不能为空哦~',
	          type: 'warning',
	          duration: 1500
	        });
	        return;
				}
			}else {
				this.createRoomMsg.roomName = '房间' + parseInt(Math.random(0) * 100000);
				this.createRoomMsg.roomDesc = '一起来玩吧~';
			}
			axios({
				url: '/server/createRoom',
			  method: 'post',
			  dataType: 'json',
			  data: {
			    roomName: this.createRoomMsg.roomName,
			    roomDesc: this.createRoomMsg.roomDesc
			  }
			}).then((res) => {
		    let data = res.data;
		    console.log(data);
		    if(data.status == 1){
		    	this.$message({
	          dangerouslyUseHTMLString: true,
	          message: '房间<span style="margin: 0 10px; color: #409EFF">' + data.content.roomName + '</span>创建成功，即将进入房间...',
	          duration: 2000,
	          type: 'success'
	        });
	        setTimeout(() => {this.intoRoom(data.content.roomId, data.content.roomName)}, 2000);
		    	this.showCreateRoomDialog = false;
		    	this.createRoomMsg.roomName = null;
		    	this.createRoomMsg.roomDesc = null;
				}else{
					this.$message.error(data.desc);
				}
		  })
		  .catch((error) => {
		    this.$message.error(error);
		  });
		},
		//加入房间
		intoRoom(roomId, roomName) {
			console.log('进入房间：' + roomId);
			this.$router.push({
				name: 'main', 
				params: { 
					username: this.username,
					roomId: roomId,
					roomName: roomName
				}
			});
		},
		
		//显示登录对话框
		showLoginPrompt() {								
			this.$prompt('起 个 名 字 吧', {
				showClose: false,
				closeOnClickModal: false,
				closeOnPressEscape: false,
				roundButton: true,
	      confirmButtonText: '去 玩',
	      cancelButtonText: '随 机 起 一 个 名 字',
	      beforeClose: (action, instance, done) => {
	      	var inputVal = instance.getInputElement().value;
	        if (action === 'confirm') {
	        	if(inputVal == null || inputVal == ''){
							this.$message({
			          message: '昵称不能为空哦~',
			          type: 'warning',
			          duration: 1500
			        });
			        return;
						}

	        }
	        done();
	      }
	    }).then(({ value }) => {
      	this.loginMsg.username = value;
				this.loginByAxios();
	    }).catch(() => {
	    	this.loginMsg.username = '玩家' + parseInt(Math.random(0) * 100000);
	      this.loginByAxios();     
	    });
		},
		//打开websocket
		openWs() {
			if(window.WebSocket){
				this.ws = new WebSocket('ws://' + this.common.websocketAddress + '/?username=' + this.username);
		    this.ws.onopen = (e) => {
		        console.log("websocket 连接服务器成功");
		        //发出请求初始化roomList
		        var sendObj = {
		        	"msgType": "initRoomList"
		        }
		        this.ws.send(JSON.stringify(sendObj));
		    }
		    this.ws.onclose = (e) => {
		        console.log("websocket 服务器关闭");
		        if(this.$route.path == '/'){
		        	this.$alert('您的连接已被服务器关闭，可能是服务器正在重启或者您已在其他地方登录', '上火星了~', {
			          confirmButtonText: '重新登录',
			          type: "error",
			          callback: action => {
			          	this.username = null;
			          	this.showLoginPrompt();
			          }
			        });
		        }
		        
		    }
		    this.ws.onerror = () => {
		        console.log("websocket 连接出错");
		    }
		
		    this.ws.onmessage = (e) => {
		    	console.log(e.data);
		    	var dataJson = eval("(" + e.data + ")");
		    	if(dataJson.msgType == 'roomList'){
		    		this.roomList = dataJson.roomList;
		    	}
		    }
		  }
		}
  },
  computed:{
		myRoomList(){
			let myRoomList = [];
			this.roomList.forEach((ele, index) => {
				if(ele.roomCreator == this.username){
					myRoomList.push(ele);
				}
			});
			return myRoomList;
		},
	},
  
  //vue渲染完成钩子
  mounted() {
  	//判断是否有username cookie，如果有直接读取cookie进行登录
		this.username = this.common.getCookie('username');
		if(this.username != null && this.username != ''){
			this.loginMsg.username = this.username;
			this.loginByAxios();
		}else{
			this.showLoginPrompt();
		}
  }
}
</script>

<style scoped>
	.user-avator{
		border-radius: 50%;
		width: 100px;
		box-shadow: 2px 2px 2px #42B983;
		cursor: pointer;
	}
	.room-avator{
		border-radius: 50%;
		width: 100px;
		box-shadow: 2px 2px 2px #81CDF7;
		cursor: pointer;
	}
	.add-btn{
		position: absolute;
		right: 20px;
		top: 10px;
	}
	.room-name{
		font-size: 17px;
		height: 40px; 
		line-height: 20px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
	.room-desc{
		font-size: 13px;
		height: 30px; 
		line-height: 15px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
	.room-creator{
		font-size: 12px;
		height: 15px; 
		line-height: 15px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}
	.room-creator span{
		color: #51F48C;
		font-size: 14px;
		margin-right: 5px;
	}
	.room-user-count{
		position: absolute;
		right: 8px;
		top: 8px;
		color: #42B983;
	}
	.room-user-count i{
		color: #FF6666;
		margin-right: 5px;
		font-size: 14px;
	}
</style>
