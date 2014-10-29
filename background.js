var DBG = true;
var DBGV = true;

var tag = "background.js";
if(DBG)console.log(">> background.js");

var mIsSpiderOn = true;

function setSpiderOn(value) {
	if(DBG)console.log("setSpiderOn: " + value);
	mIsSpiderOn = value;
}

function isSpiderOn() {
	if(DBG)console.log("isSpiderOn: " + mIsSpiderOn);
	return mIsSpiderOn;
}

chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "portOffacebook");
  	port.onMessage.addListener(function(msg) {
  		
  		if(DBG)console.log("Receive Msg:");
  		if(DBG)console.log(msg);
  		if(DBG)console.log("port:");
  		if(DBG)console.log(port);
  		
	    if(msg.actionType == WM_REQUEST_COMMAND) {
	    	// Show the page action for the tab that the sender (content script)
  			// was on.
  			chrome.pageAction.show(port.sender.tab.id);
  			if(isSpiderOn()) {
  				port.postMessage({actionType: WM_EXECUTE_SPIDER});	
  			}
	    } 
  	});
});

if(DBG)console.log("<< background.js");