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
function booksScreenInit() {
    $content.html('<div id="books-container" class="row"></div>');
    if (Library.songs.length > 0) {
        if(Library.books.length > 0)
        {
            var i;
            for (i = 0; i < Library.books.length; i++)
            {
                $('#books-container').append(createCard(Library.books[i].title, Library.books[i].image, i));
            }
            $('.book-card').click(function () {
                GoToSongScreen(Library.books[$(this).attr('id').replace('book-card-', '')]);
            });
        }
    }
    else
        $content.append($emptyStateCard);
    $('.create-song-button').click(function () {
        GoToVerseEditScreen();
    });
}

function createCard(title, img, id) {
    if (!img.trim())
        img = 'img/placeholder-book.jpg';
    return $('<div class="col s12 m6 l4 card book-card hoverable waves-effect" id="book-card-' + id + '"><div class="card-image waves-effect waves-block waves-light"><img src="' + img + '"></div><div class="card-content"><span class="card-title truncate">' + title + '</span></div></div>');
}
///////////////////////////////////////////////////////////////////////////////////////////////////