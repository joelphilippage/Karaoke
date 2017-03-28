/// <reference path="constructors/verse.js" />
/// <reference path="../Scripts/jquery-3.1.1.js" />
/// <reference path="constructors/verse.js" />
/// <reference path="constructors/library.js" />
/// <reference path="constructors/book.js" />
/// <reference path="constructors/song.js" />
/// <reference path="../materialize.js" />
/// <reference path="../scripts.js" />
/// <reference path="../constructors/context-menu.js" />
/// <reference path="../Scripts/jquery-3.1.1.intellisense.js" />
"use strict";

// Declare Variables
//////////////////////////////////////////////////////////////////////////////////////////////////////
var $songsCollection = $('<div class="collection with-header"></div>');
var $emptyStateCard = $('<div class="card light-green darken-3"><div class="card-content white-text"><div><i class="material-icons large right">&#xE030;</i></div><span class="card-title">Get Started</span><p>No songs were found in your library. Add songs to your library to start singing.</p></div><div class="card-action"><a class="create-song-button waves-effect waves-light btn light-green darken-4">Create Song</a></div></div>');
var lastSongsList = new Array();

var lastSongClicked;

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Events
//////////////////////////////////////////////////////////////////////////////////////////////////////
$('#new-playlist-button').click(function () {
    var $newPlaylistModal = createModal('New Playlist',
        '<p><input id="name" type="text" class="validate"><label for="name">Name</label></p><p><textarea id="description" class="materialize-textarea"></textarea><label for="description">Description</label>',
        '<a href="#!" id="create-playlist-button" class="modal-action waves-effect btn-flat">Create Playlist</a><a href="#!" class="modal-action modal-close waves-effect btn-flat ">Cancel</a>');

    $body.append($newPlaylistModal);
    $newPlaylistModal.modal({
        ready: function () {
            $('#create-playlist-button').click(function () {
                var newPlaylist = { title: $('#name').val(), description: $('#description').val(), songList: [{ title: lastSongClicked.title, book: lastSongClicked.book }] };
                if (Library.playlistExists(newPlaylist)) // If the playlist was successfully added to the library
                    Materialize.toast('Playlist with this name already exists', 1000);
                else
                {
                    Library.addPlaylist(newPlaylist);
                    $newPlaylistModal.modal('close');
                    $newPlaylistModal.remove();
                }
            });
        },
        complete: function () {
            $newPlaylistModal.remove();
        }
    });
    $newPlaylistModal.modal('open');
});
//
$('#add-playlist-btn').hover(function () {
    if ($('.dropdown-playlists-menu').css('opacity') < 1 || $('.dropdown-playlists-menu').css('display') == 'none');
    $('.dropdown-playlists-menu').dropdown('open');

    $('#playlists-menu').css({
        'top': $('#song-context-menu').position().top + $content.position().top + 'px',
        'left': $('#song-context-menu').position().left + $('#song-context-menu').width() + (($content.outerWidth(true) - $content.width()) / 2) + 'px'
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function songScreenInit(group) {
    $(".content").html('');
    if (Library.songs.length > 0) {
        $songsCollection.html('');
        var bookHTML;
        if (group && group.image) // if group is book
            bookHTML = '';
        else
            bookHTML = '<div class="col s3 header-sort" id="book-sort">BOOK</div>';
        $songsCollection.append('<div class="collection-header row"><div class="col s6 header-sort" id="title-sort">TITLE</div>' + bookHTML + '<div class="col right header-sort" id="index-sort"><i class="material-icons">&#xE405;</i></div></div>');
        $content.append($songsCollection);
        lastSongsList = filterSongsByBook(group);
        if (group && group.songList) { // If group is a playlist
            lastSongsList = Library.getPlaylistsSongs(group);
        }
        if (group && group.image) {
            displaySongs(lastSongsList, 'index', true, group);
            var bookInfo = $('.collection-item').length;
            if (bookInfo == 1)
                bookInfo = bookInfo.toString() + ' song';
            else
                bookInfo = bookInfo.toString() + ' songs';
            $songsCollection.prepend('<div class="row"><div id="book-cover-image" class="col s3"></div><div class="col s9"><div class="book-info"><h4>' + group.title + '</h4><h6 class="grey-text">' + bookInfo + '</h6> <div class="divider"></div></div></div></div>');

            $('#book-cover-image').css('background-image', 'url(' + group.image + ')');
        }
        else
            displaySongs(lastSongsList, 'title', true);
    }
    else // Add empty library message if no songs are present.
        $content.append($emptyStateCard);

    // Events for starting buttons.
    headerEvents(group);

    // Create Song Button
    $('.create-song-button').click(function () {
        GoToVerseEditScreen();
    });
}

function filterSongsByBook(book) {
    var songs = new Array();

    if (book) {
        for (var i = 0; i < Library.songs.length; i++) {
            if (Library.songs[i].book.title == book.title)
                songs.push(Library.songs[i]);
        }
    }
    else
        songs = Library.songs;

    return songs;
}

function displaySongs(songs, key, ascending, group) {
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
        if (group && group.image) // If the group is a book
            bookHTML = '';
        else
            bookHTML = '<div class="col s3 book-title-link" id="book-link-' + i + '">' + songs[i].book.title + '</div>';
        var $songCollectionItem = $('<a href="#" id="song-item-' + i + '" class="collection-item"><div class="row"><div class="col s6"><span class="truncate song-title">' + songs[i].title + ' <i>' + songs[i].subtitle + '</i></span><span><i class="material-icons song-more-button right" data-activates="song-context-menu">&#xE5D4;</i></span></div>' + bookHTML + '<div class="col right"><span>' + songs[i].index + '</span></div></div>');
        $songsCollection.append($songCollectionItem);
    }
    updateSongEvents(songs);
}

function updateSongEvents(songs) {
    if (!songs)
        songs = Library.songs;
    // Add events for collection items to link to songs

    // Whole Button
    $('.collection-item').click(function () {
        var id = $(this).attr('id').replace('song-item-', '');
        GoToVerseEditScreen(songs[id]);
    });

    // Song's book
    $('.book-title-link').click(function () {
        var id = $(this).attr('id').replace('book-link-', '');
        if(id)
            songScreenInit(songs[id].book);
    });

    // More Button
    $('.song-more-button').click(function () {
        var id = $(this).closest('.collection-item').attr('id').replace('song-item-', '');
        lastSongClicked = songs[id];
    }).dropdown({
        constrainWidth: false,
        stopPropagation: true
    });

    $('.dropdown-playlists-menu').dropdown({
        constrainWidth: false,
        hover: true
    });
}

function headerEvents(book) {
    // Sorting Buttons
    $('.header-sort').click(function () {
        var clickedKey = $(this).attr('id').replace('-sort', '');
        if ($(this).has($('#sort-arrow')).length > 0 && $('#sort-arrow').hasClass('ascending')) // If the column already has an ascending arrow
            displaySongs(lastSongsList, clickedKey, false, book);
        else
            displaySongs(lastSongsList, clickedKey, true, book);
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////