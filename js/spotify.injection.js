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

var player = document.querySelector("#app-player").contentDocument.body;

/**
 *
 * @param e
 */
var loadTrackInfo = function (e)
{
    // Artwork
    sendMessageToExtension("track-artwork", player.querySelector(".sp-image-img").style.background.split("(")[1].split(")")[0]);

    // Track Name
    sendMessageToExtension("track-name", player.querySelector("#track-name > a").text);

    // Track Artists
    var artist = player.querySelectorAll("#track-artist > a");
    var s = ""; for (var i=0; i<artist.length; i++) { s += artist[i].text;if (i < artist.length - 1) s += ", " };
    sendMessageToExtension("track-artist", s);

    // Current Time
    sendMessageToExtension("track-current", player.querySelector("#track-current").innerHTML);

    // Track Length
    sendMessageToExtension("track-length", player.querySelector("#track-length").innerHTML);
};

/**
 *
 * @param e
 */
var updateTrackInfo = function (e)
{
    if (e.target.querySelector(".sp-image-img") != null)
        sendMessageToExtension("track-artwork", e.target.querySelector(".sp-image-img").style.background.split("(")[1].split(")")[0]);
    else if (e.target.id == "track-current" && e.target.innerHTML != "")
       sendMessageToExtension("track-current", e.target.innerHTML);
    else if (e.target.id == "track-length" && e.target.innerHTML != "")
        sendMessageToExtension("track-length", e.target.innerHTML);
    else if (e.target.id == "track-name" && e.target.innerHTML != "")
        sendMessageToExtension("track-name", e.target.querySelector("a").text);
    else if (e.target.id == "track-artist")
    {
        var artist = e.target.querySelectorAll("a");
        var s = ""; for (var i=0; i<artist.length; i++) { s += artist[i].text;if (i < artist.length - 1) s += ", " };
        sendMessageToExtension("track-artist", s);
    }
};

/**
 * Spotify Injection!
 *
 * 1. First of all, we must send to the extension the previous information.
 * 2. After that, we add a new listener to be up-to-date of any change.
 */

loadTrackInfo();
player.addEventListener("DOMSubtreeModified", updateTrackInfo, false);