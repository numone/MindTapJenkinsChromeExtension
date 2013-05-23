(function (global) {
    var alarmTimeoutMinutes = 1;
    var queryUrl = 'http://jenkins.mindtap.corp.web:8080/view/Radiator_View/api/json';
    var queryData = {
        tree: "jobs[name,url,color]"
    }

    function queryJenkins(alarm) {
        chrome.browserAction.setIcon({path: 'images/loading.gif'});
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
        var redJobs = [];
        for (var i = 0; i < data.jobs.length; i++) {
            if (data.jobs[i].color === "red" || data.jobs[i].color === "red_anime") {
                redJobs.push(data.jobs[i].url);
            }
        }

        if (redJobs.length === 0) {
            chrome.browserAction.setIcon({path: 'images/green.png'});
            chrome.browserAction.setTitle({title: 'All Jobs Are Green!'});
        } else {
            chrome.browserAction.setIcon({path: 'images/red.png'});
            chrome.browserAction.setTitle({title: 'One Or More Jobs Failed!'});
        }

        localStorage.setItem('lastJenkinsRequestData', JSON.stringify(data.jobs));
        updateAndNotifyRedBuilds(redJobs);
    }

    function updateAndNotifyRedBuilds(redJobs) {
        var oldRedJobs = JSON.parse(localStorage.getItem('lastJenkinsRequestRedBuilds') || '[]');
        for (var i = 0; i < redJobs.length; i++) {
            if ($.inArray(redJobs[i], oldRedJobs) === -1) {
                var notify = webkitNotifications.createNotification('images/red.png', 'Failed Jenkins Job!', 'Look at the popup for more information');
                notify.show();
            }
        }
        localStorage.setItem('lastJenkinsRequestRedBuilds', JSON.stringify(redJobs));
    }

    function publishError(xhr, textStatus, errorThrown) {
        chrome.browserAction.setIcon({path: 'images/gray.png'});
        chrome.browserAction.setTitle({title: 'Error: ' + (errorThrown || textStatus)});
    }

    global.requestNewDataNow = function() {
        chrome.alarms.clear('queryJenkins');
        queryJenkins();
    }

    chrome.alarms.onAlarm.addListener(queryJenkins);
    queryJenkins();
})(this);