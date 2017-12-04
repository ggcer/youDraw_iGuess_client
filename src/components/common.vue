//全局变量及方法配置文件
<script>
	
export default
{
//	websocketAddress: 'localhost:9889',
	websocketAddress: 'server.natappfree.cc:45463',
	//设置cookie  
	setCookie(cname, cvalue, exdays) {  
	    var d = new Date();  
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));  
	    var expires = "expires="+d.toUTCString();  
	    document.cookie = cname + "=" + cvalue + "; " + expires;  
	},
	
	//获取cookie
	getCookie(name) {    
		let start = document.cookie.indexOf(name+"=");   
		let len = start+name.length+1;   
		if ((!start) && (name != document.cookie.substring(0,name.length))) return '';   
		if (start == -1) return '';   
		let end = document.cookie.indexOf(";",len);   
		if (end == -1) end = document.cookie.length;   
		return decodeURI(document.cookie.substring(len,end));     
	},
	
	//清除cookie
	clearCookie(name) {
		this.setCookie(name, "", -1);   
	}
}
</script>
