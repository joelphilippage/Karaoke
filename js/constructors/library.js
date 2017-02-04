var Library = {
    books: new Array(),
    addBook : function (book) {
        this.books.push(book);
        this.addSearchItem(book.title, book);
    },
    songs : new Array(),
    addSong : function (song) {
        this.songs.push(song);
        this.addSearchItem(song.title, song); // Add song's title to search index
        this.addSearchItem(song.subtitle, song); // Add song's subtitle to search index
        var v;
        for (v = 0; v < song.verses.length; v++) {
            var htmlTagRegex =/\s*(<[^>]*>)/g,
                verseLines = song.verses[v].html.split(htmlTagRegex), 
                l;
            for (l = 0; l < verseLines.length; l++) {
                if (!/<[a-z][\s\S]*>/i.test(verseLines[l]) && $.inArray({ text: verseLines[l], object: song }, this.searchItems) == -1) // If the line does not contain html and has not already been added
                {
                    this.addSearchItem(verseLines[l], song); // add the line of text to the search index
                }
            }
        }
    },
    searchItems : new Array(),
    addSearchItem : function (text, object)
    {
        if (text.length > 0) {
            var newSearchItem = [];
            newSearchItem.text = text;
            newSearchItem.object = object;
            this.searchItems.push(newSearchItem);
        }
    }
}