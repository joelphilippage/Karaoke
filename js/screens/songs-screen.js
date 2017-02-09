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
var $songsCollection = $('<div class="collection with-header"></div>');
var $emptyStateCard = $('<div class="card light-green darken-3"><div class="card-content white-text"><div><i class="material-icons large right">&#xE030;</i></div><span class="card-title">Get Started</span><p>No songs were found in your library. Add songs to your library to start singing.</p></div><div class="card-action"><a class="create-song-button waves-effect waves-light btn light-green darken-4">Create Song</a></div></div>')
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Events
//////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function songScreenInit(GoToVerseEditScreen, book) {
    $(".content").html('');
    if (Library.songs.length > 0) {
        $songsCollection.html('');
        var bookHTML;
        if (!book)
            bookHTML = '<div class="col s3 header-sort" id="book-sort">BOOK</div>';
        else
            bookHTML = '';
        $songsCollection.append('<div class="collection-header row"><div class="col s6 header-sort" id="title-sort">TITLE</div>' + bookHTML + '<div class="col right header-sort" id="index-sort"><i class="material-icons">&#xE405;</i></div></div>');
        $('.content').append($songsCollection);
        if (book) {
            if (!book.img)
                book.img = 'img/placeholder-book.jpg';
        
            displaySongs('title', true, book);
            var bookInfo = $('.collection-item').length;
            if (bookInfo == 1)
                bookInfo = bookInfo.toString() + ' song';
            else
                bookInfo = bookInfo.toString() + ' songs';
            $songsCollection.prepend('<div class="row"><div id="book-cover-image" class="col s3"></div><div class="col s9"><div class="book-info"><h4>' + book.title + '</h4><h6 class="grey-text">' + bookInfo + '</h6> <div class="divider"></div></div></div></div>');

            $('#book-cover-image').css('background-image', 'url(' + book.img + ')');
        }
        else
            displaySongs('title', true);
        updateSongEvents(GoToVerseEditScreen);
    }
    else // Add empty library message if no songs are present.
        $('.content').append($emptyStateCard);

    // Events for starting buttons.

    // Create Song Button
    $('.create-song-button').click(function () {
        GoToVerseEditScreen();
    });

    // Sorting Buttons
    $('.header-sort').click(function () {
        var clickedKey = $(this).attr('id').replace('-sort', '');
        if ($(this).has($('#sort-arrow')).length > 0 && $('#sort-arrow').hasClass('ascending')) // If the column already has an ascending arrow
            displaySongs(clickedKey, false, book);
        else
            displaySongs(clickedKey, true, book);

        updateSongEvents(GoToVerseEditScreen);
    });
}

function displaySongs(key, ascending, book) {
    var songs = new Array(),
        i;
    if (book) {
        for (i = 0; i < Library.songs.length; i++) {
            if (Library.songs[i].book.title == book.title)
                songs.push(Library.songs[i]);
        }
    }
    else
        songs = Library.songs;

    // Remove all collection items
    $('.collection-item').remove();

    // Add sort icon to header
    var $icon;
    if (ascending)
        $icon = $('<i class="material-icons ascending" id="sort-arrow">&#xE5DB;</i>');
    else
        $icon = $('<i class="material-icons descending" id="sort-arrow">&#xE5D8;</i>');

    if (key == 'index')
        $icon.addClass('right');
    // Remove exisiting arrow
    $('#sort-arrow').remove();
    // add new arrow to correct header
    $('#' + key + '-sort').append($icon);

    // Sort songs by title
    if (key == "title") {
        songs.sort(function (a, b) {
            var aLower = a.title.toString().toLowerCase(),
                bLower = b.title.toString().toLowerCase();
            if(ascending)
                return ((aLower < bLower) ? -1 : ((aLower > bLower) ? 1 : 0));
            else
                return ((aLower < bLower) ? 1 : ((aLower > bLower) ? -1 : 0));
        });
    }
    // Sort songs by book
    else if (key == "book") {
        songs.sort(function (a, b) {
            var aLower = a.book.title.toString().toLowerCase(),
                bLower = b.book.title.toString().toLowerCase();
            if (ascending)
                return ((aLower < bLower) ? -1 : ((aLower > bLower) ? 1 : -1));
            else
                return ((aLower < bLower) ? 1 : ((aLower > bLower) ? -1 : -1));
        });
    }
    // Sort songs by index
    else if (key == "index") {
        songs.sort(function (a, b) {
            if (ascending)
                return parseInt(a.index) - parseInt(b.index);
            else
                return parseInt(b.index) - parseInt(a.index);
        });
    }

    // Loop through library of songs and add them to collection
    var i,
        bookHTML;
    for (i = 0; i < songs.length; i++) {
        if (!book)
            bookHTML = '<div class="col s3">' + songs[i].book.title + '</div>';
        else
            bookHTML = '';
        var $songCollectionItem = $('<a href="#" id="song-item-' + i + '" class="collection-item gray-text darken-4"><div class="row"><div class="col s6">' + songs[i].title + ' <i>' + songs[i].subtitle + '</i></div>' + bookHTML + '<div class="col right"><span>' + songs[i].index + '</span></div></div>');
        $songsCollection.append($songCollectionItem);
    }
}

function updateSongEvents(GoToVerseEditScreen) {
    // Add events for collection items to link to songs
    $('.collection-item').click(function () {
        var id = $(this).attr('id'),
            songIndex = id.substring(10, id.length);
        GoToVerseEditScreen(Library.songs[songIndex]);
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////