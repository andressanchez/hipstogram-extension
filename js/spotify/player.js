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