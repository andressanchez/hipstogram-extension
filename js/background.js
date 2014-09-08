/*
 * Copyright (c) 2014 Andrés Sánchez Pascual
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * Spotify Object
 */
var spotify =
{
    track: {
        uri: null,
        title: "Untitled",
        artist: "Unknown",
        time: "0:00",
        length: "1:00",
        cover: null
    },
    player: {
        status: "playing"
    },
    events: {
        upcoming: {
            timestamp: 0,
            startTime: "0:00",
            endTime: "0:00",
            startEvent: "track-changed",
            endEvent: "track-playing",
            uri: null,
            title: "Untitled",
            artist: "Unknown",
            cover: null
        },
        pending: [],
        acknowledged: []
    },
    tabId: null
};

/**
 * Spotify Injection!
 * Inject the necessary Javascript to every Spotify Play tab
 */

chrome.tabs.query({ url: "*://play.spotify.com/*" }, function(tabs)
{
    if (spotify.tabId == null && tabs != null && tabs.length > 0) inject(tabs[0]);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
    if (spotify.tabId != null && tabId == spotify.tabId)
    {
        spotify.tabId = null;
        newEventHandle(); // Force to create a new event
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
    if (!String.prototype.contains) {
        String.prototype.contains = function(s, i) {
            return this.indexOf(s, i) != -1;
        }
    }

    if (spotify.tabId == null && tab.url.contains("://play.spotify.com/")) inject(tab);
});

function inject(tab)
{
    spotify.tabId = tab.id;
    console.log("Injecting JS in " + tab.url + "!");
    chrome.tabs.executeScript(spotify.tabId, {file: "js/spotify/injection.js"});
    console.log("Injection completed!");
}

/**
 * Spotify Player Controllers
 *
 * playPauseTrack - Play/Pause Spotify Player
 * previousTrack - Change to previous track
 * nextTrack - Change to next track
 *
 */

function playPauseTrack() {
    if (spotify.tabId != null)
        chrome.tabs.executeScript(spotify.tabId,{code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#play-pause").click();'});
}

function previousTrack() {
    if (spotify.tabId != null)
        chrome.tabs.executeScript(spotify.tabId, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#previous").click();'});
}

function nextTrack() {
    if (spotify.tabId != null)
        chrome.tabs.executeScript(spotify.tabId, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#next").click();'});
}

/**
 * An update from Spotify Play
 */
chrome.extension.onMessage.addListener(function(request, sender)
{
    if (request.action == "spotify-update")
    {
        var newValue = request.value;

        // Update events
        eventHandler(newValue);

        // Update track and player
        spotify.track.cover = newValue.track.cover;
        spotify.track.title = newValue.track.title;
        spotify.track.artist = newValue.track.artist;
        spotify.track.uri = newValue.track.uri;
        if (newValue.track.time != "") spotify.track.time = newValue.track.time;
        spotify.track.length = newValue.track.length;
        spotify.player.status = newValue.player.status;
    }
});


/**
 * Update events with the new information
 * @param newValue New Spotify Object
 */
function eventHandler(newValue)
{
    var WAIT_WINDOW = 5000; // 5 seconds
    var currentTS = new Date().getTime();
    var timeFromLatestUpdate = Math.abs(timeToSeconds(newValue.track.time) - timeToSeconds(spotify.track.time));

    // Always update the current time except if its value is "0:00"
    if (newValue.track.time != "0:00" && newValue.track.time != "") spotify.events.upcoming.endTime = newValue.track.time;

    // If a new track is playing
    if (spotify.track.cover != newValue.track.cover ||
        spotify.track.uri != newValue.track.uri ||
        spotify.track.title != newValue.track.title ||
        spotify.track.artist != newValue.track.artist ||
        spotify.track.length != newValue.track.length)
    {
        // A trick to know if the events belong to the same track or not
        if (currentTS - spotify.events.upcoming.timestamp > WAIT_WINDOW) newEventHandle(newValue, false);

        // Update upcoming event
        spotify.events.upcoming.timestamp = currentTS;
        spotify.events.upcoming.cover = newValue.track.cover;
        spotify.events.upcoming.title = newValue.track.title;
        spotify.events.upcoming.artist = newValue.track.artist;
        if (newValue.track.uri.split(":").length == 3)
            spotify.events.upcoming.uri = newValue.track.uri.split(":")[2];
    }
    // If the user has seek a specific part of the track
    else if (timeFromLatestUpdate > 2 && newValue.track.time != "0:00")
    {
        // In seeks, we keep the old time
        spotify.events.upcoming.endTime = spotify.track.time;

        newEventHandle(newValue, true);

        // Update upcoming event
        spotify.events.upcoming.timestamp = currentTS;
        spotify.events.upcoming.cover = newValue.track.cover;
        spotify.events.upcoming.title = newValue.track.title;
        spotify.events.upcoming.artist = newValue.track.artist;
        if (newValue.track.uri.split(":").length == 3)
            spotify.events.upcoming.uri = newValue.track.uri.split(":")[2];
    }
}

/**
 * Handle the creation of a new event
 * @param newValue New Spotify Object
 * @param isSeek If it is the same track but a different part
 */
function newEventHandle(newValue, isSeek)
{
    // Set the reason because the upcoming event must end
    if (spotify.events.upcoming.endTime == spotify.track.length) spotify.events.upcoming.endEvent = 'track-ended';
    else if (spotify.tabId == null) spotify.events.upcoming.endEvent = 'tab-closed';
    else if (isSeek) spotify.events.upcoming.endEvent = 'track-seek';
    else spotify.events.upcoming.endEvent = 'track-changed';

    // Apparently, there is a case in which endTime is empty
    if (spotify.events.upcoming.endTime == null || spotify.events.upcoming.endTime == "") spotify.events.upcoming.endTime = "0:00";

    // Just, if it is not the initial event
    if (spotify.events.upcoming.startTime != spotify.events.upcoming.endTime && (spotify.events.upcoming.uri != null || isSeek))
    {
        printEvent();
        spotify.events.pending.unshift(spotify.events.upcoming);
        sendEvent(spotify.events.upcoming);
    }

    // Create an upcoming event with the reason because it was created
    if(isSeek)
    {
        spotify.events.upcoming =
        {
            startTime: newValue.track.time,
            startEvent: "track-seek",
            endEvent: "track-playing"
        };
    }
    else
    {
        spotify.events.upcoming =
        {
            startTime: "0:00",
            startEvent: "track-changed",
            endEvent: "track-playing"
        };
    }
}

/**
 * Send a new event to the backend
 * @param event Event to be sent
 */
function sendEvent(event)
{
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = (function(e)
    {
        return function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                var index = spotify.events.pending.indexOf(e);
                if (index > -1) {
                    spotify.events.pending.splice(index, 1);
                    spotify.events.acknowledged.unshift(e);
                }
            }
        }
    })(event);

    xmlhttp.open("POST","http://api.hipstogram.io:8081/events",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("content=[" + JSON.stringify(event) + "]");
}

/**
 * Print the upcoming event - Just for debug purposes
 */
function printEvent()
{
    console.log("New event");
    console.log("---------------------");
    console.log(spotify.events.upcoming.cover);
    console.log(spotify.events.upcoming.title);
    console.log(spotify.events.upcoming.artist);
    console.log(spotify.events.upcoming.uri);
    console.log(spotify.events.upcoming.startTime);
    console.log(spotify.events.upcoming.startEvent);
    console.log(spotify.events.upcoming.endTime);
    console.log(spotify.events.upcoming.endEvent);
    console.log("---------------------");
}

/**
 * Convert time in format "mm:ss" to seconds
 * @param time Time in format "mm:ss"
 * @returns {number} Number of seconds
 */
function timeToSeconds(time)
{
    var a = time.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]);
    return seconds;
}