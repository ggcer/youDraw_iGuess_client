<template>
  <el-container v-show="username != null && username != ''">
  	<el-aside width="350px">
			<div class="about-users">
				<p>
					<span class="roomname-span">{{roomName}}</span>
		  		<el-button type="primary" class="back-btn" @click="backToRoomList">返 回</el-button>
				</p>
				<el-card class="box-card" style="margin-left: 5%;">
				  <div class="user-item" v-for="(item, index) in userListBySourceDesc" v-bind:class="{readyDiv: item.isReady}">
				    <div class="user-item-position" v-bind:class="{firstPosition: index == 0, secondPosition: index == 1, thirdPosition: index == 2}">{{index + 1}}</div>
				  	<img src="../assets/images/init-avatar.jpg" class="user-item-avator">
				  	<div class="user-item-msg">
				  		<p class="msg-top">
				  			<span class="msg-top-username">{{item.username}}</span>
				  			<img src="../assets/images/flower.png" class="flower-img"><span class="count">{{item.flower}}</span>
				  			<img src="../assets/images/egg.png" class="egg-img"><span class="count">{{item.egg}}</span>
				  		</p>
				  		<p class="msg-bottom">
				  			<img src="../assets/images/source.png" class="source-img">
				  			<span class="count">{{item.source}}</span>
				  			<img src="../assets/images/palette.png" v-show="item.isMyTurn" class="palette-img">
				  			<span class="left-second" v-show="item.isMyTurn">[{{drawLeftSecond}}]</span>
				  		</p>
				  	</div>
				  </div>
				</el-card>
			</div>
			
			<div class="gtalk-content" id="gtalk-content">
				<div id="msg-content" class="msg-content">
					<div class="msg-item" v-for="(item, index) in gtalkMsgList">
						<p>
							<span class="msg-username" v-html="item.username"></span>：<span class="msg-msg" v-html="item.gtalkMsg"></span>
						</p>
					</div>
				</div>
				<div class="clear"></div>
				<el-row v-show="!isMyTurn" style="cursor: default;">
				  <el-col :span="18">
						<el-autocomplete prefix-icon="el-icon-edit" v-model="gtalkMsg" :fetch-suggestions="querySearch" placeholder="说点什么吧..."></el-autocomplete>
				  </el-col>
				  <el-col :span="6">
		  			<el-button type="primary" @click="sendGtalkMsg">发 送</el-button>
				  </el-col>
				</el-row>
			</div>
		</el-aside>
		<el-main id="el-main">
			<!-- 取色器等工具栏 -->
			<div id="colorpicker-wrap">
				<div class="colorpicker-img-wrap">
					<img src="../assets/images/colorpicker.png" v-show="!isShowColorpicker" @click="isShowColorpicker = true" class="colorpicker-img-show">
					<img src="../assets/images/arrow-top.png" v-show="isShowColorpicker" @click="isShowColorpicker = false" class="colorpicker-img-hidden">
				</div>
				<transition name="el-zoom-in-top">
					<div id="colorpicker" v-show="isShowColorpicker">
						<div id="picker"></div>
			    	<div id="slide"></div>
			    	<div class="clear"></div>
			    	<div class="tool-bar">
			    		<div id="preview-color" style="background-color: #000000;"></div>
			    		<div id="paint-weight">
			    			<span v-bind:class="{active: nowActivePaintWeightSpan == 'thin'}" @click.stop="changePaintWeight('thin')">细</span>
			    			<span v-bind:class="{active: nowActivePaintWeightSpan == 'middle'}" @click.stop="changePaintWeight('middle')">中</span>
			    			<span v-bind:class="{active: nowActivePaintWeightSpan == 'bold'}" @click.stop="changePaintWeight('bold')">粗</span>
			    			<span v-bind:class="{active: nowActivePaintWeightSpan == 'super-bold'}" @click.stop="changePaintWeight('super-bold')">超粗</span>
			    		</div>
			    		<div class="clear"></div>
			    		<div id="pencil-eraser" v-show="isMyTurn">
			    			<div class="img-wrap" v-bind:class="{selectImgWrap: isUsePencil}">
			    				<img id="pencil-img" src="../assets/images/pencil.png" alt="画笔" @click.stop="usePencil(true)"/>
			    			</div>
			    			<div class="img-wrap" v-bind:class="{selectImgWrap: !isUsePencil}">
			    				<img id="eraser-img" src="../assets/images/eraser.png" alt="橡皮擦" @click.stop="usePencil(false)"/>
			    			</div>
			    		</div>
			    	</div>
					</div>
				</transition>
			</div>
			
			<!-- 主画板 -->
			<canvas id="paint" v-bind:class="{crosshair: isMyTurn}" width="950" height="500"></canvas>
			
			<!-- 其他提示信息 -->
			<div class="ready-wrap">
		  	<el-button type="primary" v-show="!isReady && !isGameStart" @click="isReadyToPlay(true)">准 备</el-button>
				<el-button type="primary" v-show="isReady && !isGameStart" @click="isReadyToPlay(false)">取 消 准 备</el-button>
			</div>
			<div class="question-wrap" v-show="isGameStart && isMyTurn">
				请绘制：<span style="margin-right: 20px;color: #27AE60;">{{question.name}}</span><el-button type="primary" @click="clearDraw">重 画</el-button>
			</div>
			<div class="question-wrap" v-show="isGameStart && !isMyTurn">
				提示：<span style="color: #27AE60;">{{question.desc}}</span>
			</div>
			
			<!-- 游戏结果dialog -->
			<el-dialog title="游戏结束" :visible.sync="isGameEnd" width="700px" :before-close="closeGameResultDialog">
				<el-tabs v-model="tabGameEndResultType">
			    <el-tab-pane label="积分榜" name="sourceList">
			    	<el-table :data="gameResultUserList" :stripe="true" :default-sort="{prop: 'source', order: 'descending'}">
					    <el-table-column type="index" label="排名" width="220" align="center"></el-table-column>
					    <el-table-column property="username" label="玩家" width="220" align="center"></el-table-column>
					    <el-table-column property="source" sortable label="积分" width="220" align="center"></el-table-column>
					  </el-table>
			    </el-tab-pane>
			    <el-tab-pane label="鲜花榜" name="flowerList">
			    	<el-table :data="gameResultUserList" :stripe="true" :default-sort="{prop: 'flower', order: 'descending'}">
					    <el-table-column type="index" label="排名" width="220" align="center"></el-table-column>
					    <el-table-column property="username" label="玩家" width="220" align="center"></el-table-column>
					    <el-table-column property="flower" sortable label="收到鲜花数" width="220" align="center"></el-table-column>
					  </el-table>
			    </el-tab-pane>
			    <el-tab-pane label="鸡蛋榜" name="eggList">
			    	<el-table :data="gameResultUserList" :stripe="true" :default-sort="{prop: 'egg', order: 'descending'}">
					    <el-table-column type="index" label="排名" width="220" align="center"></el-table-column>
					    <el-table-column property="username" label="玩家" width="220" align="center"></el-table-column>
					    <el-table-column property="egg" sortable label="被投鸡蛋数" width="220" align="center"></el-table-column>
					  </el-table>
			    </el-tab-pane>
			    <el-tab-pane label="献花榜" name="throwFlowerList">
			    	<el-table :data="gameResultUserList" :stripe="true" :default-sort="{prop: 'throwFlower', order: 'descending'}">
					    <el-table-column type="index" label="排名" width="220" align="center"></el-table-column>
					    <el-table-column property="username" label="玩家" width="220" align="center"></el-table-column>
					    <el-table-column property="throwFlower" sortable label="献出鲜花数" width="220" align="center"></el-table-column>
					  </el-table>
			    </el-tab-pane>
			    <el-tab-pane label="投蛋榜" name="throwEggList">
			    	<el-table :data="gameResultUserList" :stripe="true" :default-sort="{prop: 'throwEgg', order: 'descending'}">
					    <el-table-column type="index" label="排名" width="220" align="center"></el-table-column>
					    <el-table-column property="username" label="玩家" width="220" align="center"></el-table-column>
					    <el-table-column property="throwEgg" sortable label="投出鸡蛋数" width="220" align="center"></el-table-column>
					  </el-table>
			    </el-tab-pane>
			    <el-tab-pane label="更多" name="more">
			    	敬请期待
			    </el-tab-pane>
		  </el-tabs>
			</el-dialog>
		</el-main>	
	</el-container>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import '../assets/js/colorpicker/colorpicker.min.js'
import $ from 'jquery'
import 'jquery.nicescroll'
export default {
	name: 'main',
  data() {
    return {
    	username: null,
    	roomId: null,
    	roomName: null,
    	isReady: false,
    	isGameStart: false,
    	isGameEnd: false,
    	isMyTurn: false,
    	isThrowNowTurn: false,
    	isShowColorpicker: false,
    	drawLeftSecond: -1,
    	question: {},
    	
    	userList: [],
    	gtalkMsg: null,
    	gtalkMsgList: [],
    	gtalkSuggestions:[
    		{"value": "准备啦"},
    		{"value": "你是神笔马良吗？"},
    		{"value": "你是毕加索吗？"},
    	],
    	
    	gameResultUserList: [],
    	tabGameEndResultType: 'sourceList',
    	
    	myPaintRgb: {
				r: 0,
				g: 0,
				b: 0
			},
			rememberMyPaintRgb: {
				r: 0,
				g: 0,
				b: 0
			},
			myPaintWeight: 3,
			
			otherPaintRgb: {
				r: 0,
				g: 0,
				b: 0
			},
			otherPaintWeight: 3,
			
			isUsePencil: true,
			nowActivePaintWeightSpan: 'middle',
			
    	ws: null,
    	
    	paint: null,
    	ptx: null,
    	
    	common: Vue.prototype.common,
    }
  },
  methods: {
  	getParams() {
  		let params = this.$route.params;
  		console.log("页面参数：", params);
	  	this.username = params.username;
	  	this.roomId = params.roomId;
	  	this.roomName = params.roomName;
	  	
	  	//如果是从roomList跳转过来的，则设置localStorage
	  	if(this.username){
	  		window.localStorage.setItem("room-username", this.username);
	  		window.localStorage.setItem("room-roomId", this.roomId);
	  		window.localStorage.setItem("room-roomName", this.roomName);
	  	}else{		//如果是通过刷新网页进来的，则读取localStorage原先存储的数据进行websocket连接
	  		this.username = window.localStorage.getItem("room-username");
	  		this.roomId = window.localStorage.getItem("room-roomId");
	  		this.roomName = window.localStorage.getItem("room-roomName");
	  	}
  	},
  	backToRoomList() {
  		//主动关闭websocket连接
  		this.closeWs();
  		this.$router.push({
				name: 'roomList', 
				params: {
					
				}
			});
  	},
	 	querySearch(queryString, cb) {
	    var results = queryString ? this.gtalkSuggestions.filter(this.gtalkSuggestionsFilter(queryString)) : this.gtalkSuggestions;
	    // 调用 callback 返回建议列表的数据
	    cb(results);
	  },
	  gtalkSuggestionsFilter(queryString) {
	  	return (gtalkSuggestions) => {
	      return (gtalkSuggestions.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1 && gtalkSuggestions.value.length != queryString.length);
	    };
	  },
  	//关闭websocket连接
  	closeWs(){
  		if(this.ws){
  			this.ws.close();
  		}
  	},
  	isReadyToPlay(type) {
			if(this.userList.length < 2){
				this.$message({
          message: '房间中至少要有两人才能准备哦~',
          type: 'warning',
          duration: 1500
        });
				return;
			}
			this.isReady = type;
			let sendObj = {
				"msgType": "isReadyToPlay",
				"roomId": this.roomId,
				"username": this.username,
				"isReady": type
			}
			this.ws.send(JSON.stringify(sendObj));
		},
		clearAndResetCanvas() {
			this.paint.height = this.paint.height;
	    this.ptx.beginPath();
	    if(this.isMyTurn){
	    	//画笔颜色粗细初始为自己的画笔颜色粗细
				this.ptx.lineWidth = this.myPaintWeight; 
	    	this.ptx.strokeStyle = `rgba(${this.myPaintRgb.r},${this.myPaintRgb.g},${this.myPaintRgb.b},255)`;
	    }else{
	    	//画笔颜色初始为别人的画笔颜色粗细
	    	this.ptx.lineWidth = this.otherPaintWeight;
	    	this.ptx.strokeStyle = `rgba(${this.otherPaintRgb.r},${this.otherPaintRgb.g},${this.otherPaintRgb.b},255)`;
	    }
		},
		clearDraw() {
			this.clearAndResetCanvas(true);
			let sendObj = {
				"msgType": "clearDraw",
				"roomId": this.roomId,
				"username": this.username
			}
			this.ws.send(JSON.stringify(sendObj));
		},
		countDrawLeftSecond() {
			if(this.drawLeftSecond > 0){
				this.drawLeftSecond--;
			}
		},
		throwFlowerOrEgg(type){
			if(this.isThrowNowTurn){
				this.$message({
		      message: '上一轮你已经投过鲜花或鸡蛋了哦，不能重复投递~',
		      type: 'warning',
		      duration: 2000
		    });
				return;
			}
			let sendObj = {
				"msgType": "throwFlowerOrEgg",
				"roomId": this.roomId,
				"type": type,
				"throwUsername": this.username
			}
			this.ws.send(JSON.stringify(sendObj));
			this.isThrowNowTurn = true;
		},
		changePaintWeight(type) {
			if(type == 'thin'){
				this.nowActivePaintWeightSpan = 'thin';
				this.myPaintWeight = 2;
			}else if(type == 'middle'){
				this.nowActivePaintWeightSpan = 'middle';
				this.myPaintWeight = 3;
			}else if(type == 'bold'){
				this.nowActivePaintWeightSpan = 'bold';
				this.myPaintWeight = 8;
			}else if(type == 'super-bold'){
				this.nowActivePaintWeightSpan = 'super-bold';
				this.myPaintWeight = 12;
			}
			this.isUsePencil = true;
			this.myPaintRgb = this.rememberMyPaintRgb;
			//如果在我的回合，直接重置画笔
			if(this.isMyTurn){
				this.ptx.beginPath();
				this.ptx.strokeStyle = `rgba(${this.myPaintRgb.r},${this.myPaintRgb.g},${this.myPaintRgb.b},255)`;
				this.ptx.lineWidth = this.myPaintWeight;
			}
		},
		usePencil(isUsePencil) {
			if(isUsePencil){
				this.changePaintWeight(this.nowActivePaintWeightSpan);
			}else{
				this.isUsePencil = false;
				this.myPaintRgb = {
					r: 173,
					g: 213,
					b: 255
				};
				this.ptx.beginPath();
				this.ptx.strokeStyle = `rgba(${this.myPaintRgb.r},${this.myPaintRgb.g},${this.myPaintRgb.b},255)`;
				this.myPaintWeight = 16;
				this.ptx.lineWidth = 16;
			}
		},
		sendGtalkMsg() {
			if(this.gtalkMsg == ''){
				return;
			}
			if(this.ws != null){
				let sendObj = {
        	"msgType": "gtalk",
        	"roomId": this.roomId,
        	"username": this.username,
        	"gtalkMsg": this.gtalkMsg
        }
				this.ws.send(JSON.stringify(sendObj));
				this.gtalkMsg = '';
			}
		},
		closeGameResultDialog(done) {
			done();
		},
		initGame() {
			this.isMyTurn = false;
			this.isReady = false;
			this.isGameStart = false;
			this.drawLeftSecond = -1;
			this.question = {};
			this.clearAndResetCanvas();
		}
  },
  computed:{
  	userListBySourceDesc: function(){
  		let temp = [];
			return temp.concat(this.userList).sort((val1,val2) => {
				if(val1.source > val2.source){
					return -1;
				}else if(val1.source < val2.source){
					return 1;
				}else{
					return 0;
				}
			});
		},
	},
  //vue渲染完成钩子
  mounted() {
  	//获取上一个页面的参数
  	this.getParams();
  	
		/****----websocket配置开始----****/
		if(window.WebSocket){
			this.ws = new WebSocket('ws://' + this.common.websocketAddress + '/?username=' + this.username + '&roomId=' + this.roomId);
	    this.ws.onopen = (e) => {
	        console.log("websocket 连接服务器成功");
	        //发出请求初始化roomList
        var sendObj = {
        	"msgType": "getRoomPlayerMsg",
        	"roomId": this.roomId
        }
        this.ws.send(JSON.stringify(sendObj));
        
        //发出获取房间信息的请求
        sendObj = {
        	"msgType": "getRoomMsg",
        	"roomId": this.roomId
        }
        this.ws.send(JSON.stringify(sendObj));
	    }
	    this.ws.onclose = (e) => {
	        console.log("websocket 服务器关闭");
	        if(this.$route.path == '/main'){
	        	this.$alert('您的连接已被服务器关闭，可能是服务器正在重启或者您已在其他地方登录', '上火星了~', {
		          confirmButtonText: '返回首页',
		          type: "error",
		          callback: action => {
		          	this.closeWs();
		          	this.backToRoomList();
		          }
		        });
	        }
	    }
	    this.ws.onerror = () => {
	        console.log("websocket 连接出错");
	    }
	
	    this.ws.onmessage = (e) => {
//		    console.log(e.data);
	    	var dataJson = eval("(" + e.data + ")");
	    	if(dataJson.msgType == 'getRoomPlayerMsg'){
	    		this.userList = dataJson.userList;
	    	}else if(dataJson.msgType == 'gameStart'){
	    		this.$message({
	          message: '游戏开始',
	          duration: 2000,
	          type: 'success'
	        });
	    		this.isGameStart = true;
	    	}else if(dataJson.msgType == 'gameTurn'){
	    		var turnUsername = dataJson.turnUsername;
	    		if(this.username == turnUsername){
	    			this.isMyTurn = true;
	    			this.$message({
		          message: '轮到你啦~',
		          duration: 2000,
		          type: 'success'
		        });
	    		}else{
	    			this.isMyTurn = false;
	    		}
	    		
	    		//清除画布并重置画笔颜色
	    		this.clearAndResetCanvas();
	    		this.question = dataJson.question;
	    		this.drawLeftSecond = 60;
	    	}else if(dataJson.msgType == 'gtalk'){
        		this.gtalkMsgList.push({
        			username: dataJson.username,
        			gtalkMsg: dataJson.gtalkMsg
        		})
        		let msgContent = $('#msg-content');
        		msgContent.niceScroll().resize();
        		msgContent.animate({
            	scrollTop:msgContent.get(0).scrollHeight
            }, 300);
        }else if(dataJson.msgType == 'turnResult'){
	    		this.$notify({
			      dangerouslyUseHTMLString: true,
			      message: '<div style="padding-right: 10px">' + dataJson.turnResultMsg + '<br><br>'
			      					+ '<a href="javascript:void(0)" style="text-decoration: none;'
											+ 'padding: 5px 10px; margin-right: 20px; font-size: 12px;'
											+	'background-color: #65F599;color: white; border-radius: 8px;" onclick="throwFlowerOrEgg(1)">神笔马良</a>'
			      					+ '<a href="javascript:void(0)" style="text-decoration: none;'
											+ 'padding: 5px 10px; margin-right: 20px; font-size: 12px;'
											+	'background-color: #FF5252;color: white; border-radius: 8px;" onclick="throwFlowerOrEgg(2)">什么玩意</a></div>',
			      duration: 5000
			    });
			    this.isThrowNowTurn = false;
	    	}else if(dataJson.msgType == 'throwFlowerOrEggResult'){
	    		let fromUsername = dataJson.fromUsername;
	    		let toUsername = dataJson.toUsername;
	    		let type = dataJson.type;
	    		let flowerImg = '<img style="width: 20px; vertical-align: middle;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADqElEQVRYR7WWTWwbRRTH/2921x9JSFNXnBuOSFVJL42rUuJeEYeCOIDIYXNJY6okRkIoULV1IyIC4mARwiY9kD2AckNBAsEFkYZDknIgURDXpndCnY9qbe/uPDSubLmpvbE3zp48u2/e+83/fYwJTT6Ps5ke6Xm/kKSXEfM+Sty27jW5NdCMmnWyc3PsZ0i8ruxJ8FZiauZ8s3uD7BoCONZIbzw9t+18eeNsYV9kZIkytY46zvi98Q9nHx0Xoi7AziejW2A6F0iu8eeJT2cm2g6wOznyjudEFpt0vAEJu+NFfymsGqEVOASY7zjj94WBqAtwMDV+vrgvV0B0qhJI9CTQ9fa72P/uW3DBeU4gI86vdd+e+aNJ5apmDYvwv5tjFkuMVCwpFkfs8gCc3359LgYJzCWmvkq3GrzcUY027UyM5UAYD3TKvGvE5GB3dvanMMGDAT4e3QbobGAnGN5gYvKb78MGbwiwNzl6xXVo5SjHguXV09NfLx9l1/IgejyR6ZUkH1Y3Mm9C5wP44nKtsxMDUEH2pt9/1TvQr5AnFk9P57bL77I33igWxaIAdam1YPFS5VtYFZq+CyoBVIs+7Cx94XXI+xeG5z8LG7jaXWEdWOtDdrp/wQy7/9gA82tmRjKW0pfscnrCPnVTsPCX2VMoIaMR/T58ceF+Pef3Hph9LJG6nrRzYYMHzoHZ1cEtEM5ppOfBWGLG3cOnbUcaGhah9cA0Xa+4oAkNGhlPD8lsR6P4YOiCnVfLuTUzN5K0n/mf0KoagV1grQ8tu35hwIcPKX10Gt2KYoMl3lRqWOtmNt1vZ1sNWmsfCKDy7HjFlaJ0XvCki6iIVSGiEVxVdXKiAIpUQUgmNW5PHbi70ISOuNYJBt8lRs+JpqAilYLwmXIEDPjsouA5IBL7cb3rh9pZYK2avUT0iisLyYgWLZSrnGjZMHizUjeH09XSJLT+NFOQSAGUguQSCP+kk3ZGvScfd0CUcvwnZYVKfgGqdtTvJ+6eSt1mNMKpwyAtAdTSz6+b16RAXgER6I76li/9C0MYEKQjIiLV7mHGI03wteGL9saxFKjdrFpQrX144yVZQtFzENVicNktm3XqXU8BGD9Go2y2JQW1ADNr762ylMln5gRQlj6ixeBL929d6Leu99tLQW0aKgXlopTyLYLoZqI+AvqYkQdhm5g3hIBdT+56IKEAlPzMyB33Igq8C4Jka8cIDn0dqztCMPJH5bbZ8dxyCtp5egX5P2HshjDjk/wYAAAAAElFTkSuQmCC">';
	    		let eggImg = '<img style="width: 20px; vertical-align: middle;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACQ0lEQVRYR8WXi1FUUQyGPzqQCtAKwAqQCtAOtAIsQSsAKhArQCsAKxArADrQCnQ+5mTn3t3zumdXzczOvm6SP8mfnJw9lssz4Ax4BRwl9TvgFrgEfi4xubfkYeBDcv4VuEpONSGYt8Br4Bz42Gu3F4BRXwP7yclDwcFz4AtwD7zryUYPAJ3fAD9SlK3gfP4COAROWiB6AFhb62p6l4h6kYmiXguANdexNV5ELsBMCMKSaCcrNQAy/DvwEpDlI6INQfie5U0NgIo6fp88G9HSLKg65cNGECUAptzUyWqdBhHflCKppEddo9fmRiZLAOxxxd5WtuFCZEEgYW+FNwfAqGXvi4Q8vttSlmVEwoZzZFbGHABRWvcYs36OThhxHjqCN7OR3affcwB8QJRBvqziABLLaCZmZcgBkDA6l4TK70k5BvyuVCThp2SrygEdRu+L2Az4vgvR9izo9QwEWVoTchSMAGZEXHdkmjx4/hYAyysHVt30rwHoWDL+NwBTfhXbcKNOowXP6DVJqE6c/aNTr4RXgnsWOJKrbWj/+2DxDB/MSOyMs8WmNIrdep0FuxQD89UcxeuH0S5AFG32Hsfbglg/X6oc8M9AvM06Fk5iLYvlZhZMbeJ5IAUXRlYxHcUm5Y1pVvtA0Rq5kuagZ7/P1Ejn3pL0sbEJ9QLQiMiXgui+zLQyEEAFcZpmg+msidEa+efJUlN8vheABjwpBeI4jZ5+TJPTa1hcUH8lx12TdAmAiMJJ5ktWH6cfv6UFdnpj7mrdP9OhgiGhXgnyAAAAAElFTkSuQmCC">';
	    		if(type == 1){
						if(fromUsername == this.username && toUsername == this.username){
							this.$message({
					      dangerouslyUseHTMLString: true,
					      message: '觉得自己画的不错，给自己赏了朵<span style="color: #FF5252; margin-left: 10px">鲜花</span>',
					      type: 'success',
					      duration: 2000
					    });
						}else if(fromUsername == this.username && toUsername != this.username){
							this.$message({
					      dangerouslyUseHTMLString: true,
					      message: '您向<span style="color: #409EFF; margin:0 10px">' + toUsername + '</span>投递了一朵<span style="color: #FF5252; margin-left: 10px">鲜花</span>，竖起大拇指表示大赞',
					      type: 'success',
					      duration: 2000
					    });
						}
						
						//gtalk公屏放送
						if(fromUsername == toUsername){
							this.gtalkMsgList.push({
								"username": '<span style="color: #FF5252">房管</span>',
								"gtalkMsg": '<span style="color: #409EFF; margin-right:10px">' + fromUsername + '</span>奖励了自己一朵' + flowerImg
							})
						}else{
							this.gtalkMsgList.push({
								"username": '<span style="color: #FF5252">房管</span>',
								"gtalkMsg": '<span style="color: #409EFF; margin-right:10px">' + fromUsername + '</span>向<span style="color: #409EFF; margin:0 10px">' + toUsername + '</span>投递了一朵' + flowerImg 
							})
						}
					}else if(type == 2){
						if(fromUsername == this.username && toUsername == this.username){
							this.$message({
					      dangerouslyUseHTMLString: true,
					      message: '自己都看不下去了，自己朝脑门上砸了颗<span style="color: #660000; margin-left: 10px">鸡蛋</span>',
					      type: 'success',
					      duration: 2000
					    });
						}else if(fromUsername == this.username && toUsername != this.username){
							this.$message({
					      dangerouslyUseHTMLString: true,
					      message: '您向<span style="color: #409EFF; margin:0 10px">' + toUsername + '</span>丢了一颗<span style="color: #660000; margin-left: 10px">鸡蛋</span>，大喊一声这什么玩意',
					      type: 'success',
					      duration: 2000
					    });
						}
						
						//gtalk公屏放送
						if(fromUsername == toUsername){
							this.gtalkMsgList.push({
								"username": '<span style="color: #FF5252">系统</span>',
								"gtalkMsg": '<span style="color: #409EFF; margin-right:10px">' + fromUsername + '</span>往自己脑袋上敲了一颗' + eggImg
							})
						}else{
							this.gtalkMsgList.push({
								"username": '<span style="color: #FF5252">系统</span>',
								"gtalkMsg": '<span style="color: #409EFF; margin-right:10px">' + fromUsername + '</span>向<span style="color: #409EFF; margin:0 10px">' + toUsername + '</span>扔了一颗' + eggImg 
							})
						}
					}
					let msgContent = $('#msg-content');
	    		msgContent.niceScroll().resize();
	    		msgContent.animate({
	        	scrollTop:msgContent.get(0).scrollHeight
	        }, 300);
	    	}else if(dataJson.msgType == 'drawImg'){
	    		let mouseMoveToX = dataJson.mouseMoveToX;
	    		let mouseMoveToY = dataJson.mouseMoveToY;
	    		let drawPointX = dataJson.drawPointX;
	    		let drawPointY = dataJson.drawPointY;
	    		let paintRgb = dataJson.paintRgb;
	    		let paintWeight = dataJson.paintWeight;
	    		if(mouseMoveToX){
	    			this.ptx.moveTo(mouseMoveToX, mouseMoveToY);
	    		}
	    		
	    		//如果和otherPaintRgb的画笔颜色不同则重新设置otherPaintRgb的画笔颜色[otherPaintWeight也进行相同处理]
	    		if(this.otherPaintRgb.r != paintRgb.r || this.otherPaintRgb.g != paintRgb.g || this.otherPaintRgb.b != paintRgb.b || this.otherPaintWeight != paintWeight){
	    			this.ptx.beginPath();
	    			if(this.otherPaintRgb.r != paintRgb.r || this.otherPaintRgb.g != paintRgb.g || this.otherPaintRgb.b != paintRgb.b){
	    				this.otherPaintRgb = paintRgb;
	    				this.ptx.strokeStyle = `rgba(${paintRgb.r},${paintRgb.g},${paintRgb.b},255)`;
	    			}
	    			if(this.otherPaintWeight != paintWeight){
	    				this.otherPaintWeight = paintWeight;
	    				this.ptx.lineWidth = paintWeight
	    			}
	    		}
	    		//绘制图像
	    		this.ptx.lineTo(drawPointX, drawPointY);
	        this.ptx.stroke();
	    	}else if(dataJson.msgType == 'clearDraw'){
	    		this.clearAndResetCanvas();
	    	}else if(dataJson.msgType == 'resetGame'){
	    		this.$alert(`由于玩家<span style="margin: 0 10px; color: #FF5252">${dataJson.exitUsername}</span>中途退出房间，游戏重新开始`, '提示', {
	          dangerouslyUseHTMLString: true,
	          confirmButtonText: '确定',
	          type: "info",
	          callback: action => {
	          	
	          }
	        });
	    		this.initGame();
	    	}else if(dataJson.msgType == 'gameEnd'){
	    		this.gameResultUserList = dataJson.gameResultUserList;
					this.isGameEnd = true;
	    		this.initGame();
	    	}
	    }
  	}
		/****----websocket配置结束----****/
		
		//画布配置
		this.paint = document.getElementById('paint');
		this.ptx = this.paint.getContext('2d');
		var paint = this.paint;
		var ptx = this.ptx;
		//设置初始笔刷  
		ptx.strokeStyle = `rgba(${this.myPaintRgb.r},${this.myPaintRgb.g},${this.myPaintRgb.b},255)`;
		ptx.lineWidth = 3; 
		
		var changeBasePointCount = 0;
		paint.onmousedown = (event) => {
			var body = document.documentElement;
			var elMain = document.getElementById('el-main');
			if(!this.isMyTurn){
				return;
			}
	    ptx.save();
	    var event = event || window.event;
	    var mouseMoveToX = event.clientX - paint.offsetLeft + body.scrollLeft + elMain.scrollLeft;
	    var mouseMoveToY = event.clientY - paint.offsetTop + body.scrollTop + elMain.scrollTop;
	    ptx.moveTo(mouseMoveToX, mouseMoveToY);
	        
	    paint.onmousemove = (event) => {
	    	var body = document.documentElement;
	    	var elMain = document.getElementById('el-main');
	      var event = event || window.event;
	      var drawPointX = event.clientX - paint.offsetLeft + body.scrollLeft + elMain.scrollLeft;
	    	var drawPointY = event.clientY - paint.offsetTop + body.scrollTop + elMain.scrollTop;
	      ptx.lineTo(drawPointX, drawPointY);
	      ptx.stroke();
	        
	    	changeBasePointCount++;
	    	var sendObj = '';
	    	if(changeBasePointCount == 1){
	    		sendObj = {
	        	"msgType": "drawImg",
	        	"roomId": this.roomId,
	        	"drawUsername": this.username,
	        	"mouseMoveToX": mouseMoveToX,
	        	"mouseMoveToY": mouseMoveToY,
	        	"drawPointX": drawPointX,
	        	"drawPointY": drawPointY,
	        	"paintRgb": this.myPaintRgb,
	        	'paintWeight': this.myPaintWeight
	          }
	    	}else{
	    		sendObj = {
	        	"msgType": "drawImg",
	        	"roomId": this.roomId,
	        	"drawUsername": this.username,
	        	"drawPointX": drawPointX,
	        	"drawPointY": drawPointY,
	        	"paintRgb": this.myPaintRgb,
	        	'paintWeight': this.myPaintWeight
	          }
	    	}
	        //发送绘画下一坐标
	        this.ws.send(JSON.stringify(sendObj));
	    }  
	    paint.onmouseup = () => {  
	        paint.onmousemove = null;
	        changeBasePointCount = 0;
	    }  
	    paint.onmouseout = () => {  
	        paint.onmousemove = null;
	        changeBasePointCount = 0;
	    }  
	    ptx.restore();  
    }
		
		//取色器配置
    ColorPicker(
    	document.getElementById('slide'),
    	document.getElementById('picker'),
    	(hex, hsv, rgb) => {
    		console.log('hex:', hex);
    		console.log('hsv:', hsv);
    		console.log('rgb:', rgb);
      		document.getElementById('preview-color').style.backgroundColor = hex;
      		//记录我选中的画笔颜色
      		this.myPaintRgb = rgb;
      		this.rememberMyPaintRgb = rgb;
      		this.isUsePencil = true;
      		//如果在我的回合，直接重置画笔颜色
      		if(this.isMyTurn){
      			this.ptx.beginPath();
      			this.ptx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},255)`;
      		}
    	}
    );
    //取色器拖动
    var cw = document.getElementById('colorpicker-wrap');
		cw.onmousedown = function(e) {
			if(e.target != document.getElementById('colorpicker')){
				return;
			}
			e = e || window.event;
			
			var offsetX = e.offsetX;
			var offsetY = e.offsetY;
			
			document.onmousemove = function (e) {
				var vLeft = e.clientX - offsetX;
				var vTop = e.clientY - offsetY;
				if(vLeft < 0){
					vLeft = 0;
				}else if((vLeft + cw.offsetWidth) > document.documentElement.clientWidth){
					vLeft = document.documentElement.clientWidth - cw.offsetWidth;
				}
				if(vTop < 0){
					vTop = 0;
				}else if((vTop + cw.offsetHeight) > document.documentElement.clientHeight){
					vTop = document.documentElement.clientHeight - cw.offsetHeight;
				}
			
				cw.style.left = vLeft + 'px';
				cw.style.top = vTop + 'px';
				
			}
		}
		//聊天框拖动
		var gc = document.getElementById('gtalk-content');
		gc.onmousedown = function(e) {
			e = e || window.event;
			if(e.target != gc){
				return;
			}
			var offsetX = e.offsetX;
			var offsetY = e.offsetY;
			
			document.onmousemove = function (e) {
				var vLeft = e.clientX - offsetX;
				var vTop = e.clientY - offsetY;
				if(vLeft < 0){
					vLeft = 0;
				}else if((vLeft + gc.offsetWidth) > document.documentElement.clientWidth){
					vLeft = document.documentElement.clientWidth - gc.offsetWidth;
				}
				if(vTop < 0){
					vTop = 0;
				}else if((vTop + gc.offsetHeight) > document.documentElement.clientHeight){
					vTop = document.documentElement.clientHeight - gc.offsetHeight;
				}
			
				gc.style.left = vLeft + 'px';
				gc.style.top = vTop + 'px';
				
			}
		}
		
		document.onmouseup = function(e) {
			document.onmousemove = null;
		}
		
		//nicescroll配置
		$('#msg-content').niceScroll({
        cursorcolor: "#4B4B4B",//滚动条的颜色
        cursoropacitymax: 0.5, //滚动条的透明度，从0-1
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "6px", //滚动条的宽度
        cursorborder: "0", // 游标边框css定义
        cursorborderradius: "3px",//以像素为光标边界半径  圆角
        autohidemode: true, //是否隐藏滚动条  true的时候默认不显示滚动条，当鼠标经过的时候显示滚动条
        zindex:"auto",//给滚动条设置z-index值
        railpadding: { top:0, right:0, left:0, bottom:0 }//滚动条的位置
    });
    
		//页面关闭(主要是刷新)事件注册
		window.onbeforeunload = () => {
			//主动关闭websocket连接
  		this.closeWs();
		}; 
		//页面回退事件注册
		if(window.history && window.history.pushState) {
	    window.onpopstate = (e) => {
	    	//主动关闭websocket连接
	    	this.closeWs();
			};
	  }
		//Enter建监听
    document.onkeydown = (e) => {
    		if(e.keyCode == 13){
    			let gtalkInput = document.getElementsByClassName('el-input__inner')[0];
    			//按下回车之前焦点在输入框
    			if(document.activeElement == gtalkInput){
    				if(this.gtalkMsg == null || this.gtalkMsg == ''){
    					//输入框内容为空失去焦点
    					gtalkInput.blur();
    				}else{
    					//输入框内容不为空发送信息
    					this.sendGtalkMsg();
    				}
    			}else{	//按下回车之前焦点不在输入框，输入框获得焦点
    				gtalkInput.focus();
    			}
    		}
    }
		
		//当局剩余时间计时器
		setInterval(this.countDrawLeftSecond, 1000);
		
		window.throwFlowerOrEgg = this.throwFlowerOrEgg;
		
  }
  
}
</script>

<style scoped>
	.about-users .roomname-span{
		font-size: 20px;
		margin-right: 10px;
	}
	.user-item{
		height: 60px;
		line-height: 60px;
	}
	.user-item .user-item-position{
		float: left;
		font-size: 14px;
		color: white;
		width: 20px;
		height: 20px;
		margin-top: 20px;
		line-height: 20px;
		background-color: #FFA9A1;
		border-radius: 50%;
	}
	.firstPosition{
		background-color: #FF4C3B!important;
	}
	.secondPosition{
		background-color: #FF6557!important;
	}
	.thirdPosition{
		background-color: #FF8378!important;
	}
	.user-item .user-item-avator{
		width: 60px;
		height: 60px;
		float: left;
	}
	.readyDiv{
		border-right: 3px #95ECAB solid;
	}
	.user-item .user-item-msg{
		float: left;
		height: 60px;
	}
	.msg-top, .msg-bottom{
		font-size: 14px;
		height: 30px;
		line-height: 30px;
		margin: 0 0 0 5px;
		text-align: left;
	}
	.msg-top .msg-top-username{
		display: inline-block;
		width: 100px;
		white-space: nowrap;  
		text-overflow:ellipsis; 
		overflow:hidden;
		height: 30px;
		line-height: 30px;
		vertical-align: middle;
	} 
	.flower-img, .egg-img, .source-img, .palette-img{
		width: 18px;
		margin-right: 3px;
		vertical-align: middle;
	}
	.palette-img{
		width: 32px;
	}
	.flower-img{
		margin-left: 10px;
	}
	.count{
		margin-right: 10px;
	}
	#paint{
		background-color: #ADD5FF; 
	}
	.crosshair{
		cursor: crosshair;
	}
	.ready-wrap, .question-wrap{
		margin-top: 10px;
	}
	.left-second{
		color: #FF6557;
		margin-left: 10px;
	}
	.green-span{
		color: #65F599;
	}
	.red-span{
		color: #FF5252;
	}
	#colorpicker-wrap{
		position: absolute;
		top: 40px;
		right: 0px;
		width: 195px;
		height: 230px;
	}
	.colorpicker-img-wrap{
		position: absolute;
		width: 100%;
		top: -35px;
		left: 0;
		height: 35px;
	}
	.colorpicker-img-show{
		cursor: pointer;
		width: 35px;
		transition: all 0.5s;
	}
	.colorpicker-img-show:hover{
		transform: rotate(500deg);
	}
	.colorpicker-img-hidden{
		cursor: pointer;
		width: 25px;
		margin-top: 8px;
	}
	#colorpicker{
		width: 175px;
		padding: 10px;
		border-radius: 8px;
		background-color: #343434;
		font-size: 13px;
		cursor: move;
		/*display: none;*/
	}
	#picker { 
		width: 150px;
		height: 150px;
		float: left;
		margin-right: 10px;
		cursor: pointer;
	}
	#slide { 
		width: 15px;
		height: 150px;
		float: left;
		cursor: pointer;
	}
	.clear{
		clear: both;
	}
	.tool-bar{
		cursor: default;
	}
	#preview-color{
		width: 40px;
		height: 40px;
		margin-top: 10px;
		float: left;
	}
	#paint-weight{
		float: left;
		margin-left: 10px;
		margin-bottom: 10px;
		color: white;
		font-weight: bold;
	}
	#paint-weight span{
		cursor: pointer;
		display: block;
		float: left;
		line-height: 40px;
		height: 40px;
		margin-left: 10px;
		margin-top: 10px;
	}
	.active{
		color: #FF0000;
		font-weight: bold;
	}
	#pencil-eraser{
		overflow: hidden;
	}
	#pencil-eraser .img-wrap{
		width: 25px;
		height: 25px;
		float: left;
		border-radius: 50%;
		margin-right: 10px;
	}
	#pencil-eraser .selectImgWrap{
		background-color: #C7EF51;
	}
	#pencil-img, #eraser-img{
		cursor: pointer;
		width: 20px;
		height: 20px;
		margin-left: 2.5px;
		margin-top: 2.5px;
	}
	
	.gtalk-content{
		background-color: rgba(153,202,255, 0.5);
		border-radius: 8px;
		position: absolute;
		top: 330px;
		left: 40px;
		width: 300px;
		height: 200px;
		z-index: 999;
		padding: 10px;
		cursor: move;
	}
	.msg-content{
		width: 100%;
		height: 150px;
		margin-bottom: 15px;
		font-size: 12px;
		cursor: default;
	}
	.msg-item{
		width: 100%;
	}
	.msg-item p{
		line-height: 30px;
		margin: 0;
		text-align: left;
	}
	.msg-username{
		font-size: 14px;
		color: #27AE60;
	}
	.msg-msg{
		letter-spacing: 1px;
	}
</style>
