/**
 * Spotify Player Controllers
 *
 * playPauseTrack - Play/Pause Spotify Player
 * previousTrack - Change to previous track
 * nextTrack - Change to next track
 *
 */

function playPauseTrack() { chrome.extension.getBackgroundPage().playPauseTrack(); }
function previousTrack() { chrome.extension.getBackgroundPage().previousTrack(); }
function nextTrack() { chrome.extension.getBackgroundPage().nextTrack(); }
function openSpotifyPlay () { chrome.tabs.create({ url: "https://play.spotify.com/" }); }