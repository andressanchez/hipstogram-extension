/**
 * Spotify Injection!
 * Inject the necessary Javascript to every Spotify Play tab
 */

var spotifyTab = null;

chrome.tabs.query({ url: "*://play.spotify.com/*" }, function(tabs)
{
    if (spotifyTab == null && tabs != null && tabs.length > 0) inject(tabs[0]);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
    if (spotifyTab != null && tabId == spotifyTab.id) spotifyTab = null;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
    if (!String.prototype.contains) {
        String.prototype.contains = function(s, i) {
            return this.indexOf(s, i) != -1;
        }
    }

    if (spotifyTab == null && tab.url.contains("://play.spotify.com/")) inject(tab);
});

function inject(tab)
{
    spotifyTab = tab;
    console.log("Injecting JS in " + spotifyTab.url + "!");
    chrome.tabs.executeScript(spotifyTab.id, {file: "js/utils.js"});
    chrome.tabs.executeScript(spotifyTab.id, {file: "js/spotify/injection.js"});
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
    if (spotifyTab =! null)
        chrome.tabs.executeScript(spotifyTab.id,{code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#play-pause").click();'});
}

function previousTrack() {
    if (spotifyTab =! null)
        chrome.tabs.executeScript(spotifyTab.id, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#previous").click();'});
}

function nextTrack() {
    if (spotifyTab =! null)
        chrome.tabs.executeScript(spotifyTab.id, {code: 'document.querySelector("#app-player").contentDocument.body.querySelector("#next").click();'});
}

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
        pending: []
    }
};

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
        spotify.track.time = newValue.track.time;
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
    //var oldtime = timeToSeconds(spotify.track.time);
    //var newtime = timeToSeconds(newValue.track.time);
    var WAIT_WINDOW = 5000; // 5 seconds
    var currentTS = new Date().getTime();

    // If a new track is playing
    if (spotify.track.cover != newValue.track.cover ||
        spotify.track.uri != newValue.track.uri ||
        spotify.track.title != newValue.track.title ||
        spotify.track.artist != newValue.track.artist ||
        spotify.track.length != newValue.track.length)
    {
        // A trick to know if the events belong to the same track or not
        if (currentTS - spotify.events.upcoming.timestamp > WAIT_WINDOW) newEventHandle('track-change');

        // Update upcoming event
        spotify.events.upcoming.timestamp = currentTS;
        spotify.events.upcoming.cover = newValue.track.cover;
        spotify.events.upcoming.title = newValue.track.title;
        spotify.events.upcoming.artist = newValue.track.artist;
        spotify.events.upcoming.uri = newValue.track.uri;
    }

    // Always update the current time
    spotify.events.upcoming.endTime = newValue.track.time;
}

/**
 * Handle the creation of a new event
 * @param endEvent Reason because a new event must be created
 */
function newEventHandle(endEvent)
{
    // Set the reason because the upcoming event must end
    spotify.events.upcoming.endEvent = endEvent;

    // Just, if it is not the first time
    if (spotify.events.upcoming.uri != null)
    {
        printEvent();
        spotify.events.pending.unshift(spotify.events.upcoming);
    }

    // Create an upcoming event with the reason because it was created
    spotify.events.upcoming =
    {
        startTime: "0:00",
        startEvent: "track-changed",
        endEvent: "track-playing"
    };
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
