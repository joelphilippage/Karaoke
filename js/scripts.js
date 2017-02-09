/// <reference path="constructors/verse.js" />
/// <reference path="../Scripts/jquery-3.1.1.js" />
/// <reference path="constructors/verse.js" />
/// <reference path="constructors/library.js" />
/// <reference path="constructors/book.js" />
/// <reference path="constructors/song.js" />
/// <reference path="../Scripts/jquery-3.1.1.intellisense.js" />

"use strict";

// Declare Variables
//////////////////////////////////////////////////////////////////////////////////////////////////////
// Arrays
var Songs = new Array(),
    songList = new Array(),
    bookTitles = new Array();

// Booleans
var songsLoaded = false,
    searchDeselected = false;

// Integers
var totalSongs = 0;
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Events
//////////////////////////////////////////////////////////////////////////////////////////////////////
$('#title-menu-item').click(function () {
    $('.button-collapse').sideNav('hide');
});
$('#songs-button').click(function () {
    GoToSongScreen();
});
$('.create-song-button').click(function () {
    GoToVerseEditScreen();
});
$('#books-button').click(function () {
    GoToBookScreen();
});
// Window
$(window).resize(function () {
    UpdateSearchBar();
}).keyup(function (e) {
    if (!e.metaKey && !e.ctrlKey) {
        // Check if current element is not editable and key pressed is not up or down
        if (searchDeselected)
            searchDeselected = false;
        else if (!editMode && ($(document.activeElement).is('input') == false || $('#search-label').hasClass('active')) && e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40)
            RunSearch(e);
    }
});

$('#search').keydown(function (e) {
    var $collection = $('#search-results .collection-item');

    if (e.keyCode == 13) { // enter
        $('#search-results .active').trigger('click'); // Run click event on selected search result
        $('#search').trigger('focus').trigger('blur'); // Deselect search form
        searchDeselected = true;
        NavBar.hide();
    }
    if (e.keyCode == 38) // up arrow
    {
        var lastIndex = $('.collection-item.active').index();

        $('.collection-item.active').attr('class', 'collection-item');
        if (lastIndex > 0)
            $($collection[lastIndex - 1]).addClass('active');
        else
            $($collection[$collection.length - 1]).addClass('active');
        return false;
    }
    if (e.keyCode == 40) // down arrow
    {
        var lastIndex = $('.collection-item.active').index();

        $('.collection-item.active').attr('class', 'collection-item');
        if (lastIndex < $collection.length - 1)
            $($collection[lastIndex + 1]).addClass('active');
        else
            $($collection[0]).addClass('active');
        return false;
    }
});

// When all songs have loaded
$(document).ajaxStop(function () {
    GoToSongScreen();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function init() {
    // Initialize collapse button
    $(".button-collapse").sideNav({
        menuWidth: 250,
        closeOnClick: true
    });
    LoadSongs("library");
    UpdateSearchBar();
}

function GoToSongScreen() {
    ResetMainArea();
    songScreenInit(GoToVerseEditScreen);
    UpdateSearchBar();
}

function GoToVerseEditScreen(songToEdit) {
    ResetMainArea();
    loadVerseEditScreen(songToEdit);
    UpdateSearchBar();
}

function GoToBookScreen() {
    ResetMainArea();
    booksScreenInit(GoToVerseEditScreen, songScreenInit);
    UpdateSearchBar();
}

function LoadSongs(URL) {
    var href
    $.ajax({
        url: URL,
        success: function (data) {
            var elements = $(data).find("td > a"),
                jsonURLs = new Array(),
                href,
                i;
            elements.each(function () {
                href = $(this).attr('href');
                if (href.indexOf('.') == -1 && href.indexOf('..') == -1 && href != '/Karaoke/' && href != '/Karaoke/library/') {
                    LoadSongs('library/' + href);
                }
                if ($(this).attr('href').indexOf('.json') >= 0)
                    jsonURLs.push(URL + '/' + href);
            });
            if (jsonURLs.length) {
                totalSongs += jsonURLs.length;
                for (i = 0; i < jsonURLs.length; i++) {
                    LoadSong(jsonURLs[i], function (loadedSong) {
                        if (loadedSong) {
                            if (loadedSong.book && loadedSong.book.title && !ArrayContainsID(Library.books, loadedSong.book.title)) // If the book has been named and it is not already in library
                                Library.addBook(loadedSong.book); // Add new book to library
                            Library.addSong(loadedSong); // Add song to library

                            $('.determinate').css('width', (Library.songs.length / totalSongs) * 100 + '%');
                        }
                    });
                }
            }
        }
    });
}

function LoadSong(filename, callback) {
    $.getJSON(filename, function (data) {
        callback(data);
    });
}

function ResetMainArea() {
    $('.content').html('');
    $('.chord').remove();
    $('.modal').remove();
    $('.content').removeAttr('style');
    $('body').removeAttr('style');
    $('#header-menu').html('');
    $('header').removeAttr('style');
    GoToEditMode();
}

function UpdateSearchBar() {
    $('.search-form').attr('style', 'margin: 0 ' + $('#header-menu').width() + 'px 0 ' + ($('.button-collapse').outerWidth(true) + $('.brand-logo').outerWidth(true) + 25) + 'px;');
}

function ArrayContainsID(array, title) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].title == title)
            return true;
    }
    return false;
}

function RunSearch(e)
{
    if (!$('#search-label').hasClass('active')) { // If search form is not selected
        var keypressed = String.fromCharCode(e.keyCode); // Set value of pressed key.
        if (!e.shiftKey)
            keypressed = keypressed.toLowerCase();
        $('#search').focus(); // select search element
        $('#search').val(keypressed);
    }
    var searchText = $('#search').val().toLowerCase(),
        regEx = new RegExp(searchText, "ig"),
        searchItems = Library.searchItems,
        l,
        searchResults = $.grep(Library.searchItems, function (i) {
            return i.text.toLowerCase().indexOf(searchText) != -1;
        });
    $('#search-results').html('');
    var resultsLength = searchResults.length;
    if (searchText.trim().length <= 0)
        resultsLength = 0;

    if ($('#search').val().length <= 0)
        SearchResults.hide();
    else
        SearchResults.show();

    if (resultsLength > 0) {
        SearchResults.show();
        if (resultsLength > 5)
            resultsLength = 5;
    }
    else
        SearchResults.hide(true);

    

    for (l = 0; l < resultsLength; l++) {
        var icon = 'book';
        if (searchResults[l].object.verses) // If the object is a song
            icon = 'music_note';
        $('#search-results').append($('<a href="#!" id="search-result-' + l + '" class="collection-item"><i class="small material-icons left">' + icon + '</i><span class="truncate">' + searchResults[l].text.replace(regEx, '<b>' + $('#search').val() + '</b>') + '</span></a>'));
    }
    // Add click event for search item
    $('#search-results .collection-item').click(function () {
        var clickedObject = searchResults[$(this).attr('id').replace('search-result-', '')].object;

        if (clickedObject.verses) // If the object is a song
            GoToVerseEditScreen(clickedObject);
        else {
            ResetMainArea();
            songScreenInit(GoToVerseEditScreen, clickedObject);
        }

        $('#search').val(''); // Clear Search bar.
        SearchResults.hide();
    });

    var $collection = $('#search-results .collection-item');
    $($collection[0]).addClass('active');
}

var SearchResults = {
    show: function () {
        NavBar.show();
        $('#search-results').css('display', 'block');
    },
    hide: function (text) {
        $('#search-results').css('display', 'none');
        if (!text) {
            $('#search').trigger('focus').trigger('blur');
            NavBar.hide();
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize
init();