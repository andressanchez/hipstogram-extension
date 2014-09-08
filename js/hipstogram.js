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