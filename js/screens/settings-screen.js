/// <reference path="constructors/verse.js" />
/// <reference path="../Scripts/jquery-3.1.1.js" />
/// <reference path="constructors/verse.js" />
/// <reference path="constructors/library.js" />
/// <reference path="constructors/book.js" />
/// <reference path="constructors/song.js" />
/// <reference path="../materialize.js" />
/// <reference path="../scripts.js" />
/// <reference path="../Scripts/jquery-3.1.1.intellisense.js" />
"use strict";

// Declare Variables
//////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Events
//////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function settingsScreenInit() {
    var DisplaySettings = createSettingsCard('Display Settings', '<h6>Title display mode</h6><p><input name="title-group" type="radio" id="none" /><label for="none">None</label></p><p><input name="title-group" type="radio" id="first" /><label for="first">First Verse</label></p><p><input name="title-group" type="radio" id="always" /><label for="always">Always</label></p>')
    $(".content").append(DisplaySettings);
    $content.css('width', '50%');
}

function createSettingsCard(title, contents) {
    return $('<div class="card flow-text"><div class="card-content"><span class="card-title">' + title + '</span>' + contents + '</div></div>');
}
///////////////////////////////////////////////////////////////////////////////////////////////////