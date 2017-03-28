/// <reference path="../../Scripts/jquery-3.1.1.js" />
var Library = {
    books: new Array(),
    addBook : function (book) {
        this.books.push(book);
        this.addSearchItem(book.title, book);
    },
    booksAsAutocomplete : function() {
        var autoCompleteBooks = '{', i;
        for (i = 0; i < Library.books.length; i++) {
            autoCompleteBooks += '"' + Library.books[i].title + '": ';
            if (Library.books[i].image)
                autoCompleteBooks += '"' + Library.books[i].image + '"';
            else
                autoCompleteBooks += 'null';

            if (i + 1 < Library.books.length)
                autoCompleteBooks += ', ';
        }
        autoCompleteBooks += '}';
        return JSON.parse(autoCompleteBooks);
    },
    songs : new Array(),
    addSong : function (song) {
        this.songs.push(song);
        this.addSearchItem(song.title, song); // Add song's title to search index
        this.addSearchItem(song.subtitle, song); // Add song's subtitle to search index
        var v;
        for (v = 0; v < song.verses.length; v++) {
            if (song.verses[v].mirror > -1 && song.verses[v].mirror != null) {
                var htmlTagRegex = /\s*(<[^>]*>)/g,
                    verseLines = song.verses[v].html.split(htmlTagRegex),
                    l, c;
                for (l = 0; l < verseLines.length; l++) {
                    if (!/<[a-z][\s\S]*>/i.test(verseLines[l])) // If the line does not contain html and has not already been added
                    {
                        this.addSearchItem(verseLines[l], song); // add the line of text to the search index
                    }
                }
                for (c = 0; c < song.verses[v].chords.length; c++) // Loop through song's chords to add them in the tags library
                    this.addTag(song.verses[v].chords[c].ChordText);
            }
        }
        var t;
        for (t = 0; t < song.tags.length; t++)
            this.addTag(song.tags[t]); // Add the tag
    },
    songExists: function(songTitle, bookTitle)
    {
        for(var s = 0; s < this.songs.length; s++)
        {
            if (this.songs[s].title == songTitle && this.songs[s].book.title == bookTitle)
                return this.songs[s];
        }
        return false;
    },
    searchItems : new Array(),
    addSearchItem : function (text, object)
    {
        var newSearchItem = true;
        if (this.searchItems.length <= 0) {
            for (var i = 0; i < this.searchItems.length; i++) {
                if (this.searchItems[i].text == text && this.searchItems[i].object != object) // Does a search item with the same text already exist
                {
                    newSearchItem = false;
                }
            }
        }
        if (text.length > 0 && newSearchItem) {
            var newSearchItem = [];
            newSearchItem.text = text;
            newSearchItem.object = object;
            this.searchItems.push(newSearchItem);
        }
    },
    playlists: new Array(),
    addPlaylist: function (playlist) { // Adds playlist to library
        this.playlists.push(playlist); // Add playlist to current array
    },
    addToPlaylist: function(playlistName, song) // Adds song to playlist returning the playlist
    {
        for (var i = 0; i < this.playlists.length; i++) // loop through playlists
        {
            if (this.playlists[i].title == playlistName) // playlist with a matching name was found.
            {
                this.playlists[i].songs.push({ title: song.title, object: song.book });
                return this.playlists[i];
            }
        }
    },
    playlistExists: function(playlist) {
        var songsWithTitle = $.grep(this.playlists, function (e) { return e.title == playlist.title });
        if (songsWithTitle.length)
            return true;
    },
    getPlaylistsSongs: function (playlist) {
        var songs = new Array();
        for(var i = 0; i < playlist.songList.length; i++)
        {
            var song = this.songExists(playlist.songList[i].title, playlist.songList[i].book.title);
            if(song)
                songs.push(song);
            else
            {
                playlist.songList.splice(i, 1); // If no song was found remove the item from the playlist
                i--;
            }
        }
        return songs;
    },
    tags: new Array(),
    addTag: function (tag) {
        if (tag != 'undefined' && !ArrayContainsID(this.tags, tag)) // If the tag is not already in library
        {
            if (typeof tag == 'string')
                tag = { tag: tag };
            this.tags.push(tag); // add the tag
        }
    },
    tagsAsAutocomplete: function () {
        var autocompleteTags = '{', i;
        for (i = 0; i < this.tags.length; i++) {
            autocompleteTags += '"' + this.tags[i].tag + '": null';
            if (i + 1 < this.tags.length)
                autocompleteTags += ', ';
        }
        autocompleteTags += '}';
        return JSON.parse(autocompleteTags);
    }
}