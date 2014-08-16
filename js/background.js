/**
 *
 */

chrome.tabs.query({ url: "*://play.spotify.com/*" }, function(tabs)
{
    var current = tabs[0];

    console.log("Injecting JS in " + current.url + "!");
    chrome.tabs.executeScript(current.id, {file: "js/spotify.injection.js"}, function(content_result) {});
    console.log("Injection completed!");
});

/**
 *
 * @type {{track: {uri: string, title: string, artist: string, time: string, length: string, artwork: string}, player: {status: string}}}
 */

var spotify =
{
    track:
    {
        uri: "spotify:track:7skutlFh5m9qOpfgZMSenH",
        title: "Valtari",
        artist: "Sigur Rós",
        time: "3:28",
        length: "8:18",
        artwork: "elements/spotify-player/images/3a0f72f604b4f7bcb06fad0f0ab8e00ae6623dd7.jpg"
    },
    player:
    {
        status: "playing" // Either "playing" or "paused"
    }
};

/**
 *
 */

chrome.extension.onMessage.addListener(function(request, sender)
{
    if (request.action == "track-current") spotify.track.time = request.value;
    else if(request.action == "track-length") spotify.track.length = request.value;
    else if(request.action == "track-name") spotify.track.title = request.value;
    else if(request.action == "track-artist") spotify.track.artist = request.value;
    else if(request.action == "track-artwork") spotify.track.artwork = request.value;
});