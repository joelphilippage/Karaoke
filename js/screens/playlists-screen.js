/// <reference path="../../Scripts/jquery-3.1.1.js" />
/// <reference path="../helpers.js" />
/// <reference path="../constructors/library.js" />

function loadPlaylistsScreen() {
    DisplayPlaylists();
}

function DisplayPlaylists() {
    $content.html('<div id="playlists-container" class="row"></div>');
    for (var i = 0; i < Library.playlists.length; i++) {
        $('#playlists-container').append(CreatePlaylistCard(Library.playlists[i], i));
        $('#playlist-' + i).click(function () {
            DisplayPlaylist(Library.playlists[$(this).attr('id').replace('playlist-','')]);
        });
    }
}

function DisplayPlaylist(playlist) {
    songScreenInit(playlist);
}

function CreatePlaylistCard(playlist, index) {
    return $('<div class="card col s12 m4 l3 waves-effect hoverable" id="playlist-' + index + '"><div class="card-image waves-effect"><img src="' + GetBookImagesFromPlaylist(playlist)[0] + '"></div><div class="card-content"><span class="card-title">' + playlist.title + '</span></div></div>');
}

function GetBookImagesFromPlaylist(playlist) {
    var books = new Array();
    for(var i = 0; i < playlist.songList.length; i++)
    {
        if (books.indexOf(playlist.songList[i].book) == -1) // If book is not already in playlist
            books.push(playlist.songList[i].book);
    }
    var images = new Array();
    for(var b = 0; b < books.length; b++)
    {
        for(var l = 0; l < Library.books.length; l++)
        {
            if (books[b].title == Library.books[l].title) // If a match was found
                images.push(Library.books[l].image);
        }
    }
    return images;
}