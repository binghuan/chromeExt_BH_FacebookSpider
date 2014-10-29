var Log = function(){};

Log.prototype =  {
	e:function(tag, msg) {
		console.log("E/" + tag+ ": " + msg);
	},
	d:function(tag, msg) {
		console.log("D/" + tag+ ": " + msg);
	},
	v:function(tag, msg) {
		console.log("V/" + tag+ ": " + msg);
	}	
}