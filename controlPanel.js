var LOG_TAG = "controlPanel.js";

console.log(">> controlPanel.js");
$('document').ready(function() {	
	$('#button_start').click(function() {
		console.log("** user presses start button");
		chrome.extension.getBackgroundPage().setSpiderOn(true);
	});

	$('#button_stop').click(function() {
		console.log("** user presses stop button");
		chrome.extension.getBackgroundPage().setSpiderOn(false);
	});	
	
	$('#button_showDB').click(function() {
		console.log("** user presses show data button");
		chrome.tabs.getSelected(null, function(tab) {
		  chrome.tabs.sendMessage(tab.id, {actionType: WM_SHOW_DATA}, function(response) {
		    console.log(response);
		  });
		});
	});
		
});

console.log("<< controlPanel.js");



