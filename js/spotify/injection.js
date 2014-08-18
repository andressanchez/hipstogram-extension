function inject()
{
    // Player Element
    var player = document.querySelector("#app-player").contentDocument.body;

    /**
     * Create a new Spotify Object from extracting the current
     * information from player.
     * @returns {{JSON}} Spotify Object
     */
    var createSpotifyObject = function () {
        var spotify = { track: {}, player: {}};

        // Cover
        spotify.track.cover = player.querySelector(".sp-image-img").style.background.split("(")[1].split(")")[0];

        // Title
        spotify.track.title = player.querySelector("#track-name > a").text;

        // Extract artists
        var artist = player.querySelectorAll("#track-artist > a");
        var s = "";
        for (var i = 0; i < artist.length; i++) {
            s += artist[i].text;
            if (i < artist.length - 1) s += ", "
        }
        ;
        spotify.track.artist = s;

        // Current Time
        spotify.track.time = player.querySelector("#track-current").innerHTML;

        // Track Length
        spotify.track.length = player.querySelector("#track-length").innerHTML;

        // URI
        spotify.track.uri = player.querySelector("#track-add").getAttribute("data-uri");

        // Update player status
        spotify.player.status = player.querySelector("#play-pause").className.contains("playing") ? "playing" : "pause";

        return spotify;
    };

    /**
     * Send a message to Hipstogram extension
     * @param action Action Type
     * @param value Message content
     */
    function sendMessageToExtension(action, value) {
        chrome.extension.sendMessage({
            action: action,
            value: value
        });
    }

    /**
     * Callback to update Hipstogram extension
     * @param e Event
     */
    var sendUpdate = function (e) {
        var spotifyObject = createSpotifyObject();

        // The event will be triggered before the status is changed
        if (e != null && e.type == "click") spotifyObject.player.status = (spotifyObject.player.status == "playing" ? "pause" : "playing");

        sendMessageToExtension("spotify-update", spotifyObject);
    };

    /**
     * Spotify Injection!
     *
     * 1. First of all, we must send the previous information to the extension.
     * 2. After that, we add a new listener to be notified of any change.
     */

    sendUpdate();
    player.addEventListener("DOMSubtreeModified", sendUpdate, false);
    player.addEventListener("click", sendUpdate, false);
};

var readyStateCheckInterval = setInterval(function()
{
    if (document.readyState === "complete")
    {
        inject();
        clearInterval(readyStateCheckInterval);
    }
}, 1);