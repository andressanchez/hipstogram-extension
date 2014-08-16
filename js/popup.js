document.addEventListener('polymer-ready', function()
{
    // Connect tabs with pages
    var tabs = document.querySelector('paper-tabs');
    var pages = document.querySelector('core-pages');
    tabs.addEventListener('core-select', function(event) {
        pages.selected = tabs.selected;
    });

    // Get Spotify object from background script
    document.querySelector("spotify-player").spotify =
    {
        track:
        {
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
    };//chrome.extension.getBackgroundPage().spotify;

    // Set the event to show the about toast
    document.querySelector('#about-tab').onclick = showAboutToast;
});

function showAboutToast()
{
    document.querySelector('paper-toast').show();
}