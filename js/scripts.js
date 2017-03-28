/// <reference path="constructors/verse.js" />
/// <reference path="../Scripts/jquery-3.1.1.js" />
/// <reference path="constructors/verse.js" />
/// <reference path="constructors/library.js" />
/// <reference path="constructors/book.js" />
/// <reference path="constructors/song.js" />
/// <reference path="helpers.js" />
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
    searchDeselected = false,
    songsLoaded = false;

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
$('#settings-button').click(function () {
    GoToSettingsScreen();
});
$('#tags-button').click(function () {
    GoToTagsScreen();
});
$('#playlists-button').click(function () {
    GoToPlaylistsScreen();
});

// Window
$(window).resize(function () {
    UpdateSearchBar();
}).keypress(function (e) {
    if ((((String.fromCharCode(e.keyCode).replace(/[\x00-\x1F\x7F-\x9F]/g, "") != '') && !e.ctrlKey) || e.keyCode == 8) &&
        (($(document.activeElement).is('input') == false && document.activeElement.hasAttribute('contenteditable') == false) ||
            $(document.activeElement).attr('id') == 'search')) {// If not editing text or the text is the search bar
        e.preventDefault();
    }
}).keyup(function (e) {
    if ((((String.fromCharCode(e.keyCode).replace(/[\x00-\x1F\x7F-\x9F]/g, "") != '') && e.keyCode != 37 && e.keyCode != 39 && !e.ctrlKey) || e.keyCode == 8) &&
        (($(document.activeElement).is('input') == false && document.activeElement.hasAttribute('contenteditable') == false) ||
            $(document.activeElement).attr('id') == 'search')) {// If not editing text or the text is the search bar
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
}).blur(function (e) {
    $('#search').val('');
    searchDeselected = true;
    NavBar.hide();
    $('#search-results').css('display', 'none');
});

// When all songs have loaded
$(document).ajaxStop(function () {
    if (!songsLoaded) {
        songsLoaded = true;
        GoToSongScreen();
    }
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
    LoadPlaylists();
    LoadSongs("library");
    UpdateSearchBar();
}

function GoToSongScreen(book) {
    ResetMainArea(function () {
        Clear();
        songScreenInit(book);
        UpdateSearchBar();
    });
}

function GoToVerseEditScreen(songToEdit) {
    ResetMainArea(function () {
        Clear();
        loadVerseEditScreen(songToEdit);
        UpdateSearchBar();
    });
}

function GoToBookScreen() {
    ResetMainArea(function () {
        Clear();
        booksScreenInit();
        UpdateSearchBar();
    });
}

function GoToSettingsScreen() {
    ResetMainArea(function () {
        Clear();
        settingsScreenInit();
        UpdateSearchBar();
    });
}

function GoToTagsScreen() {
    ResetMainArea(function () {
        Clear();
        loadTagsScreen();
        UpdateSearchBar();
    })
}

function GoToPlaylistsScreen() {
    ResetMainArea(function () {
        Clear();
        loadPlaylistsScreen();
        UpdateSearchBar();
    })
}

function LoadPlaylists() {
    $.ajax({
        url: 'playlists.json',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                Library.addPlaylist(data[i]);
            }
        }
    });
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

function ResetMainArea(saveConfirmed) {
    if (changesMade && editMode) {
        var ConfirmSave = createModal('Changes were made', '<h6>Would you like to save?</h6>','<a href="#!" id="confirm-save-btn" class=" modal-action modal-close waves-effect waves-light-green btn-flat">Yes</a><a href="#!" class=" modal-action modal-close waves-effect waves-light-green btn-flat">No</a>');
        $body.append(ConfirmSave);
        ConfirmSave.modal({
            dismissible: false,
            ready: function () {
                $('#confirm-save-btn').click(function () {
                    saveSong(CurrentSong);
                });
            },
            complete: function () {
                changesMade = false;
                Clear();
                if(saveConfirmed)
                    saveConfirmed();
            }
        });
        ConfirmSave.modal('open');
    }
    else if(saveConfirmed)
        saveConfirmed();
}

function Clear() {
    $content.html('');
    $('.chord').remove();
    $('.modal').remove();
    $('.modal-overlay').remove();
    $content.removeAttr('style');
    $body.removeAttr('style');
    $('#header-menu').html('');
    $('header').removeAttr('style');
    GoToEditMode();
}

function RunSearch(e) {
    var keypressed = String.fromCharCode(e.keyCode); // Set value of pressed key.
    if (!e.shiftKey)
        keypressed = keypressed.toLowerCase();
    $('#search').focus(); // select search element
    if (e.keyCode != 38 && e.keyCode != 40) {
        if (e.keyCode == 8) // Backspace was pressed
        {
            $('#search').val($('#search').val().slice(0, -1));
            e.preventDefault();
        }
        else
            $('#search').val($('#search').val() + keypressed);


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