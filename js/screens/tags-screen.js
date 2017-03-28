/// <reference path="../../Scripts/jquery-3.1.1.intellisense.js" />
/// <reference path="../materialize.js" />
/// <reference path="../constructors/library.js" />
/// <reference path="../../Scripts/jquery-3.1.1.js" />
/// <reference path="../helpers.js" />

// Vars
var $chips = $('<div class="chips"></div>');

function loadTagsScreen() {
    
    $content.append($chips);
    $chips.material_chip({
        placeholder: 'Enter a tag',
        secondaryPlaceholder: '+Tag',
        autocompleteData: Library.tagsAsAutocomplete()
    });

    $chips.on('chip.add chip.delete', function (e, chip) {
        lastSongsList = filterSongsByTags($chips.material_chip('data'));
        displaySongs(lastSongsList, 'title', true);
    });
    $content.append($songsCollection);

    headerEvents();
}

function filterSongsByTags(tags) {
    var songs = new Array();
    if (tags.length) {
        var tagsStrings = convertToStringArray(tags);
        for (var i = 0; i < Library.songs.length; i++) { // start looping through songs
            if (Library.songs[i].tags.length > 0) {
                var chordList = new Array();
                for (var v = 0; v < Library.songs[i].verses.length; v++) {
                    for (var c = 0; c < Library.songs[i].verses[v].chords.length; c++) {
                        var chord = Library.songs[i].verses[v].chords[c].ChordText;
                        if (chordList.indexOf(chord == -1))
                            chordList.push(chord);
                    }
                }

                var songsTags = convertToStringArray(Library.songs[i].tags).concat(chordList);

                if (arrayContainsAnotherArray(tagsStrings, songsTags)) // If the song has all the required tags
                    songs.push(Library.songs[i]);
            }
        }
    }
    else
        songs = Library.songs;

    return songs;
}

function convertToStringArray(Object)
{
    var stringArray = new Array();
    for (var i = 0; i < Object.length; i++) {
        if (Object[i].tag)
            stringArray.push(Object[i].tag);
        else if (Object[i].ChordText)
            stringArray.push(Object[i].ChordText);
    }
    return stringArray;
}