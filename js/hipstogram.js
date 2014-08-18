document.addEventListener('polymer-ready', function()
{
    // Connect tabs with pages
    var tabs = document.querySelector('paper-tabs');
    var pages = document.querySelector('core-pages');
    tabs.addEventListener('core-select', function(event) {
        pages.selected = tabs.selected;
    });

    // Get Spotify Object from the background script
    document.querySelector("spotify-player").spotify = chrome.extension.getBackgroundPage().spotify;
    document.querySelector("events-list").spotify = chrome.extension.getBackgroundPage().spotify;

    // Set the event to show a toast in the page 'About'
    document.querySelector('#about-tab').onclick = showAboutToast;
});

function showAboutToast() { document.querySelector('paper-toast').show(); }