var DBG = true;

if(DBG)console.log(">> contentScript.js");
var tag = "contentScript.js";

var port = chrome.runtime.connect({name: "portOffacebook"});
port.onMessage.addListener(function(msg) {
	if(msg.actionType === WM_EXECUTE_SPIDER){
		if(DBG){console.log("Receive Msg: WM_EXECUTE_SPIDER");}
		if(DBG){console.log(msg);}
		performSpiderAction(); 
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.actionType == WM_SHOW_DATA) {
    	alert("Ready to show all data");
    	displayAllData();	
    }
});

function performSpiderAction() {
	
	if(DBG){console.log(">> performSpiderAction");}
	
	var url = "",
		userName = "",
		userLink = null,
		pageInfo = {};

	url = document.location.toString();
	userName = document.location.toString().split("/")[3];
	if(userName === "" || userName.length < 1) {
		
		userLink = document.querySelector('.navLink');
		
		if(userLink === undefined){
			log.v(LOG_TAG, "");
		} else {
			userName = userLink.href.replace("http://www.facebook.com/", "").replace("?ref=tn_tnmn", "");
		}
	}
	
	if(userName.indexOf("?") != -1) {
		userName = userName.split("?")[0];
	}
	
	pageInfo = {
		location: document.location.toString(),
		title: document.title,
		username: userName
	};
	//self.port.emit('WM_PAGE_LOAD', pageInfo);
	
	if(DBG){console.log("pageInfo: ");}
	if(DBG){console.log(pageInfo);}
	
	if(DBG)console.log("<< performSpiderAction");
	
	
	stepIntoSpider(userName);
}

function getGraphUserInfo(userName) {
	
	console.log(">>> getGraphUserInfo");
	
	var self = this;
	this.userName = userName;
	
	var remoteUrl = "http://graph.facebook.com/" + userName;
	
			$.ajax({
		        url: remoteUrl,
		        //url: "http://maps.google.com/maps/api/elevation/json?locations=39.7391536,-104.9847034&sensor=false",
		        type: 'get',
		        contentType: "text/plain",
		        async: false,
		        success: function(data) {
		        	console.log(data);
		        	
		        	// ready to store user info. into indexed db.
		        	console.log("try to deleteUserInfo in indexedDB: " + self.userName);
		        	deleteUserInfo(self.userName, getObjectStore(DB_STORE_NAME, "readwrite"));
		        	var userObj = {
		        		id: data.id,
		        		gender: data.gender,
		        		locale:data.locale,
		        		username:data.username,
		        		birthday:getBirthday(),
		        		work: getWorkInfo()
		        	}
		        	
		        	addUserInfo(userObj, function() {
		        		//alert("addUserInfo --> OK");
		        		document.location.href = "https://www.facebook.com/" + userName + "/friends";
		        	});
		        }
	        });
	        
	console.log("<<< getGraphUserInfo");
}

function parseWorkValue() {
	var work = "";
	if($("._4_ug:contains('擔任')").length > 0) {
		if($("._4_ug:contains('擔任')").find(".profileLink").length > 0) {
			work= $("._4_ug:contains('擔任')").find(".profileLink")[0].innerHTML;	
		}
		console.log("parse work path 1");
	} else if($("._4_ug:contains('Worked at')").length > 0) {
		work= $("._4_ug:contains('Worked at')").find(".profileLink")[0].innerHTML;
		console.log("parse work path 2");
	} else if($("._4_ug:contains('員工')").length > 0) {
		work= $("._4_ug:contains('員工')").find(".profileLink")[0].innerHTML;
		console.log("parse work path 3");
	}
	
	return work;
}

function stepIntoSpider(userName) {
	var facebookUserPage = "https://www.facebook.com/" + userName ;
	var currentUrl = document.location.href.toString();
	console.log("get current url:_" + currentUrl + "_");
	console.log("facebookUserPage url:_" + facebookUserPage + "_");
	// step 1. go to user page.
	if(getWorkInfo().length === 0
		&& currentUrl != facebookUserPage) {
		console.log("ready to loadurl:" + "https://" + facebookUserPage);
					
		var yes = true;//confirm("path 1");
		if(yes) { 
			document.location.href = facebookUserPage;
		}	
				
				
	} else if (document.location.href == facebookUserPage) {
				//var yes = confirm("path 2: retrieve work info.");
				//if(!yes) {return;}
				var work = parseWorkValue();

				if(work == "") {
					setWorkInfo("UNKNOWN");
				} else {
					setWorkInfo(work);
					//alert("get work:" + getWorkInfo());
				}
				
				// load about page.
				document.location.href = "https://www.facebook.com/" + userName + "/about";
				
	} else if(document.location.href.indexOf("facebook.com/" + userName + "/about") != -1) {
		var yes = true; //confirm("path 3: retrieve birthday.");
		if(!yes) {return;}
		var birthday = "";
		setBirthday("UNKNOWN");
		$(".data:contains('19')").each(function(){
			if( (this.innerHTML.indexOf("2000") != -1)
				|| (this.innerHTML.indexOf("199") != -1)
				|| (this.innerHTML.indexOf("198") != -1)
				|| (this.innerHTML.indexOf("197") != -1)) {
					//console.log(this.innerHTML);
					birthday = this.innerHTML;
					setBirthday(birthday);
			}
		});
				
		console.log("The user Birthday is:" + getBirthday());
		console.log("The user work is:" + getWorkInfo());
		//alert("work:" + getWorkInfo() + ", birthday:" + getBirthday());
		// ready to parse friedns on next step.
		getGraphUserInfo(userName);
		
	} else if (document.location.href.indexOf("facebook.com/" + userName + "/friends") != -1) {
		var yes = true; //confirm("path 4: get friend list");
		if(yes) { 
			console.log("ready to get friend list"); } else {
			console.log("cancel !");
			return;
		}
		var friendCount = -1; 
		var totalFriends = 0;
			    
		if(document.getElementsByClassName("_3sz")[0].innerHTML == "所有朋友") {
			console.log("Can see all friends !!!");

			console.log("get more link ...");
			window.scroll(0, 999999);
			friendCount = document.getElementsByClassName("_698").length;

			totalFriends = document.getElementsByClassName("_3d0")[0].innerHTML;
						
			console.log("friendCount:" + friendCount);
			console.log("totalFriends:" + totalFriends);
		}
			    
		//casper.echo("friends count: " + friendCount);
		//casper.echo("total friends: " + totalFriends);
		var lastUserName = "";
		var friends = [];
		console.log("checking link ...");
		$("[href]").each(function() {
			if(this.href.match("www.facebook.com.*?fref=pb") != null) {
				var result = this.href.split("?")[0].replace("https://www.facebook.com/", "");
				if(lastUserName == result){
								//continue;
				} else {
								console.log(result);
								lastUserName = result;
								console.log("ready to push lastUserName:" + lastUserName);
								friends.push(lastUserName);
								console.log("ready to push lastUserName -> done (" + friends.length +")");
				}
			}
		});
			    
			    console.log(friends);
			    addfriendsIntoStack(friends);
			    
			    var freindsStack = getFriendsFromStack();
			    
			    var indexToRemove = 0;
				var numberToRemove = 1;
			    var nextUser = freindsStack[0];
			    freindsStack.splice(indexToRemove, numberToRemove);
			    setfriendsIntoStack(freindsStack);
			    setWorkInfo("");
			    setBirthday("");
			    document.location.href = "https://www.facebook.com/" + nextUser;
			    
			} else {
				//var yes = confirm("path 5");
				//if(!yes) {return;}
			}
}

function addfriendsIntoStack(friends) {
	var friendsStack = getFriendsFromStack();
	var j = 0;
	for ( j =0; j< friends.length ; j++) {
		var i= 0
		var hit = false;
		for ( i = 0; i < friendsStack.length; i++) {
			if(friendsStack[i] == friends[j] ) {
				hit = true;
				break;
			}
		}
		
		if(hit == false) {
			friendsStack.push(friends[j]);		
		}
	};
	
	 setfriendsIntoStack(friendsStack);
}

function setfriendsIntoStack(friendsStack) {
	localStorage.FRIENDS = JSON.stringify(friendsStack);
}

function getFriendsFromStack() {
	if(localStorage.FRIENDS) {
		console.log("return:");
		console.log(JSON.parse(localStorage.FRIENDS));
		return JSON.parse(localStorage.FRIENDS);
	}
	
	console.log("return: []");
	return [];
}

function setWorkInfo(value) {
	localStorage.WORK = value;
}

function getWorkInfo() {
	
	if(localStorage.WORK === undefined) {
		localStorage.WORK = "";
	}
	
	return localStorage.WORK;
}

function setBirthday(value) {
	localStorage.BIRTHDAY = value;
}

function getBirthday() {
	
	if(localStorage.BIRTHDAY === undefined) {
		localStorage.BIRTHDAY = "";
	}
	
	return localStorage.BIRTHDAY;
}

function openDatabaseCallback() {
	console.log("--> openDatabaseCallback!!");
	console.log(db);
	port.postMessage({actionType: WM_REQUEST_COMMAND});
}

$('document').ready(function() {
	
	if(DBG){console.log("!! document is ready");}
	openDb(openDatabaseCallback);
});

if(DBG)console.log("<< contentScript.js");