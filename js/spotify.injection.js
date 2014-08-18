/**
 *
 */
if (!String.prototype.contains) {
    String.prototype.contains = function(s, i) {
        return this.indexOf(s, i) != -1;
    }
}

/**
 *
 * @param action
 * @param value
 */
function sendMessageToExtension(action, value)
{
    chrome.extension.sendMessage({
        action: action,
        value: value
    });
}

/**
 *
 * @type {HTMLElement}
 */
var player = document.querySelector("#app-player").contentDocument.body;

/**
 *
 * @param e
 */
var sendUpdate = function (e)
{
    var spotifyObject = createSpotifyObject();

    // The event will be triggered before the status is changed
    // Thus, we change it!
    if (e != null && e.type == "click") spotifyObject.player.status = (spotifyObject.player.status == "playing" ? "pause" : "playing");

    sendMessageToExtension("spotify-update", spotifyObject);
};

/**
 * Create a new Spotify Object from extracting the current
 * information from player.
 * @returns {{JSON}} Spotify Object
 */
var createSpotifyObject = function()
{
    var spotify = { track: {}, player: {}};

    // Artwork
    spotify.track.artwork = player.querySelector(".sp-image-img").style.background.split("(")[1].split(")")[0];

    // Title
    spotify.track.title = player.querySelector("#track-name > a").text;

    // Extract artists
    var artist = player.querySelectorAll("#track-artist > a");
    var s = ""; for (var i=0; i<artist.length; i++) { s += artist[i].text;if (i < artist.length - 1) s += ", " };
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
 * Spotify Injection!
 *
 * 1. First of all, we must send to the extension the previous information.
 * 2. After that, we add a new listener to be up-to-date of any change.
 */

sendUpdate();
player.addEventListener("DOMSubtreeModified", sendUpdate, false);
player.addEventListener("click", sendUpdate, false);