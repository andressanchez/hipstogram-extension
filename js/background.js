/**
 *
 */

var spotifyTab = null;

chrome.tabs.query({ url: "*://play.spotify.com/*" }, function(tabs)
{
    spotifyTab = tabs[0];
    console.log("Injecting JS in " + spotifyTab.url + "!");
    chrome.tabs.executeScript(spotifyTab.id, {file: "js/spotify.injection.js"}, function(content_result) {});
});

/**
 *
 * @type {{track: {uri: string, title: string, artist: string, time: string, length: string, artwork: string}, player: {status: string}}}
 */

var spotify =
{
    track:
    {
        uri: null,
        title: "Untitled",
        artist: "Unknown",
        time: "0:00",
        length: "1:00",
        artwork: null
    },
    player:
    {
        status: "playing" // Either "playing" or "paused"
    },
    events:
    {
        upcoming:
        {
            timestamp: 0,
            startTime: "0:00",
            endTime: "0:00",
            startEvent: "track-changed",
            endEvent: "track-playing",
            uri: null,
            title: "Untitled",
            artist: "Unknown",
            artwork: null
        },
        pending: []
    }
};
/**
 *
 */

chrome.extension.onMessage.addListener(function(request, sender)
{
    if (request.action == "spotify-update") updateSpotify(request.value);
});


/**
 *
 * @param newValue
 */
function updateSpotify(newValue)
{
    eventHandler(newValue);

    spotify.track.artwork = newValue.track.artwork;
    spotify.track.title = newValue.track.title;
    spotify.track.artist = newValue.track.artist;
    spotify.track.uri = newValue.track.uri;
    spotify.track.time = newValue.track.time;
    spotify.track.length = newValue.track.length;
    spotify.player.status = newValue.player.status;
}

function timeToSeconds(time)
{
    var a = time.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]);
    return seconds;
}
/**
 *
 * @param newValue
 */
function eventHandler(newValue)
{
    //var oldtime = timeToSeconds(spotify.track.time);
    //var newtime = timeToSeconds(newValue.track.time);
    var WAIT_WINDOW = 5000; // 5 seconds
    var currentTS = new Date().getTime();

    if (spotify.track.artwork != newValue.track.artwork ||
        spotify.track.uri != newValue.track.uri ||
        spotify.track.title != newValue.track.title ||
        spotify.track.artist != newValue.track.artist ||
        spotify.track.length != newValue.track.length)
    {
        if (currentTS - spotify.events.upcoming.timestamp > WAIT_WINDOW) addUpcomingEventToPending('track-change');


        spotify.events.upcoming.timestamp = currentTS;
        spotify.events.upcoming.artwork = newValue.track.artwork;
        spotify.events.upcoming.title = newValue.track.title;
        spotify.events.upcoming.artist = newValue.track.artist;
        spotify.events.upcoming.uri = newValue.track.uri;
    }

    spotify.events.upcoming.endTime = newValue.track.time;
}

/**
 *
 * @param newValue
 */
function addUpcomingEventToPending(endEvent)
{
    // End event
    spotify.events.upcoming.endEvent = endEvent;

    if (spotify.events.upcoming.uri != null)
    {
        printEvent();
        spotify.events.pending.unshift(spotify.events.upcoming);
    }

    // New upcoming event!
    spotify.events.upcoming =
    {
        startTime: "0:00",
        startEvent: "track-changed",
        endEvent: "track-playing"
    };
}

/**
 *
 */
function printEvent()
{
    console.log("New event");
    console.log("---------------------");
    console.log(spotify.events.upcoming.artwork);
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
 * Spotify Player Actions
 */

/**
 *
 */
function playPauseTrack()
{
    chrome.tabs.executeScript(spotifyTab.id, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#play-pause").click();'});
}

/**
 *
 */
function previousTrack()
{
    chrome.tabs.executeScript(spotifyTab.id, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#previous").click();'});
}

/**
 *
 */
function nextTrack()
{
    chrome.tabs.executeScript(spotifyTab.id, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#next").click();'});
}
