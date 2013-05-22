function(global) {
	var alarmTimeoutMinutes = 1;
	var queryUrl = 'http://jenkins.mindtap.corp.web:8080/view/Radiator_View/api/json';
	var queryData = {
		tree: "jobs[name,url,color]"
	}
	
	function queryJenkins(alarm) {
		$.ajax({
			url: queryUrl,
			data: queryData,
			dataType: 'json',
			success: publishResults,
			error: publishError
		});
		
		chrome.alarms.create('queryJenkins', {delayInMinutes: alarmTimeoutMinutes});
	}
	
	function publishResults(data) {
		var isGood = true;
		for(var i=0;i<data.jobs.length;i++){
			if(data.jobs[i].color === "red" || data.jobs[i].color === "red_anime"){
				isGood = false;
			}
		}
		
		if(isGood) {
			chrome.browserAction.setIcon({path:'images/green.png'});
			chrome.browserAction.setTitle({title:'All Jobs Are Green!'});
		} else {
			chrome.browserAction.setIcon({path:'images/red.png'});
			chrome.browserAction.setTitle({title:'One Or More Jobs Failed!'});
		}
		
		global.lastJenkinsRequestData = data.jobs;
	}
	
	function publishError(xhr, textStatus, errorThrown) {
		chrome.browserAction.setIcon({path:'images/gray.png'});
		chrome.browserAction.setTitle({title:'Error: ' + (errorThrown || textStatus)});
	}
	
	chrome.alarms.onAlarm.addListener(queryJenkins);
	queryJenkins();
}(this);