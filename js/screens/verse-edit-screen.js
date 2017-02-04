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

//  Content Variables
var $content = $('.content'),
	$body = $('body'),
	$verseContainer = $('<div class="verse-container"></div>'),
	$verseArea = $('<div contenteditable="true" tabindex="0" id="verse-area"></div>'),
	$contextMenu = $('<ul id="context-menu"></ul>'),
	$verseMenu = $('<ul id="verse-menu" class="side-nav"></ul>'),
	$verseMenuButton = $('<li><a href="#" data-activates="verse-menu" data-position="bottom" data-tooltip="Open the verse drawer" class="verse-menu-collapse tooltipped"><i class="material-icons">&#xE03D;</i></a></li>'),
	$saveSongButton = $('<li><a href="#" data-position="bottom" data-tooltip="Save" class="song-properties-button tooltipped"><i class="material-icons">&#xE161;</i></a></li>'),
	$editSongPropertiesButton = $('<li><a href="#" data-position="bottom" data-tooltip="Edit properties" class="tags-button tooltipped"><i class="material-icons">&#xE54E;</i></a></li>'),
	$toggleEditButton = $('<li><a href="#" data-position="bottom" data-tooltip="Toggle edit mode" class="toggle-edit-button tooltipped"><i class="material-icons">&#xE254;</i></a></li>'),
	$textBox;

//  Workable  Song
var CurrentSong = new song();

//  Integers
var verseIndex = 0,
    lastSelectedChord,
    lastSelectedVerse,
	range,
        verseAreaText;

//  Booleans
var previouslySaved = false;

// Constants
var PRE_XPATH = '/HTML[1]/BODY[1]/DIV[1]/DIV[1]/DIV[1]/';

// Chord Data
var chordsText = '{ "A": null,' +
    '"A#": null,' +
    '"A#4": null,' +
    '"A#7": null,' +
    '"A#dim": null,' +
    '"A#m": null,' +
    '"A#m7": null,' +

    '"Gsus4": null' +
    '}';

//  Menu Items
var menuItemAddChord = {
    name: 'Add Chord',
    action: function () {
        range = getSelectionX();
        var $chordModal = createModal("Add Chord", '<input type="text" id="chord-autocomplete" class="autocomplete">', 'bottom');
        $body.append($chordModal);
        $textBox = $('#chord-autocomplete');
        $chordModal.modal({
            ready: function() {
                $textBox.focus();
                $textBox.autocomplete({
                    data: JSON.parse(chordsText),
                    limit: 3,
                });
            },
            complete: function () {
                if ($textBox.val()) {
                    var newChord = {
                        ChordText: $textBox.val().replace('b', '♭'),
                        Range: range
                    };
                    Chords.add(newChord);
                    $(this).remove();
                } else $(this).remove();
            }
        });
        $chordModal.modal('open');
    }
},
    menuItemRemoveChord = {
        name: 'Remove Chord',
        action: function () {
            Chords.remove(lastSelectedChord);
        }
    },
    menuItemChangeChord = {
        name: 'Change Chord',
        action: function () {
            var $chordModal = createModal("Change Chord", '<input type="text" id="chord-autocomplete" class="autocomplete">', 'bottom');
            $body.append($chordModal);
            $textBox = $('#chord-autocomplete');
            $chordModal.modal({
                ready: function() {
                    $textBox.autocomplete({
                        data: JSON.parse(chordsText),
                        limit: 5
                    });
                    $textBox.focus();
                },
                complete: function () {
                    if ($textBox.val()) {
                        $('#chord-' + lastSelectedChord).text($textBox.val());
                        Chords.refresh();
                        $(this).remove();
                    } else $(this).remove();
                }
            });
            $chordModal.modal('open');
        }
    },
    menuItemMoveVerseUp = {
        name: 'Move Verse Up',
        action: function () {
            Verse.moveUp();
        }
    },
    menuItemMoveVerseDown = {
        name: 'Move Verse Down',
        action: function () {
            Verse.moveDown();
        }
    },
    menuItemDuplicateVerse = {
        name: 'Duplicate Verse',
        action: function () {
            Verse.duplicate();
        }
    },
	menuItemAddVerse = {
	    name: 'Add Verse',
	    action: function () {
	        Verse.add();
	    }
	},
	menuItemRemoveVerse = {
	    name: 'Remove Verse',
	    action: function () {
	        Verse.remove();
	    }
	}

// Menu Groups
var menuItems = [],
	verseContextItems = [menuItemAddChord],
	verseMenuContextItems = [menuItemAddVerse],
	verseButtonContextItems = [menuItemAddVerse, menuItemRemoveVerse, menuItemDuplicateVerse, menuItemMoveVerseUp, menuItemMoveVerseDown],
    chordWordContextItems = [menuItemRemoveChord, menuItemChangeChord];

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function verseEditInit() {
    // Add verse area to the page
    $verseContainer.append($verseArea);
}

function loadVerseEditScreen(songToEdit) {
    // Update Styles
    $body.css('background-color', 'black');
    $content.css({
        'display': 'flex',
        'flex-direction': 'row',
        'align-items': 'stretch',
        'min-height': 'calc(100% - 64px)'
    });
    verseIndex = 0;
    // Add Elements to screen
    $body.append($verseMenu);
    $content.append($verseContainer);
    $('#header-menu').append($toggleEditButton).append($editSongPropertiesButton).append($saveSongButton).append($verseMenuButton);
    if (songToEdit) {
        previouslySaved = true;
        CurrentSong = songToEdit;
        $verseArea.html(songToEdit.verses[0].html);
    } else {
        previouslySaved = false;
        CurrentSong = new song();
        $verseArea.html('<p>Type verse here.</p>');
        CurrentSong.appendVerse($verseArea.html());
    }
    $('.verse-menu-collapse').sideNav({
        menuWidth: 200,
        edge: 'right'
    });
    $('.tooltipped').tooltip({
        delay: 50
    });
    $body.append($contextMenu);
    ContextMenu.update();
    verseAreaText = $verseArea.text();
    // Events
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Document
    $(document).mousedown(function () {
        ContextMenu.hide();
    }).contextmenu(function () {
        return false;
    }).on('keydown', function (e) {
        if ($('.modal').length == 0) { // If no modal is open
            if (e.metaKey || e.ctrlKey) {
                // Add Verse
                if (String.fromCharCode(e.which).toLowerCase() === 'm') {
                    Verse.add();
                }
                    // Save Song
                else if (String.fromCharCode(e.which).toLowerCase() === 's') {
                    saveButton();
                    return false;
                }
                    // Toggle Edit Mode
                else if (String.fromCharCode(e.which).toLowerCase() === 'e') {
                    toggleEditMode();
                    return false;
                }
            }
            if (!$verseArea.attr('contenteditable')) { // If not in edit mode
                if (e.keyCode == 37) // left
                {
                    if (verseIndex > 0)
                        Verse.changeToIndex(verseIndex--);
                }
                else if (e.keyCode == 39) // right
                {
                    if (verseIndex < CurrentSong.verses.length - 1) 
                        Verse.changeToIndex(verseIndex++);
                }
                $verseArea.removeAttr('contenteditable');
            }
        }
    }).on('keypress', function (e) {
        if ($('.modal').length > 0) // If a modal is open
        {
            if (e.keyCode == 13) {
                $('.modal').modal('close');
            }
        }
    });
    // Window
    $(window).resize(function () {
        Chords.refresh();
    });
    // Verse Area
    $verseArea.contextmenu(function (e) {
        if ($verseArea.attr('contenteditable') && window.getSelection().getRangeAt(0).startOffset != window.getSelection().getRangeAt(0).endOffset) ContextMenu.show(e.pageX, e.pageY, verseContextItems);
        return false;
    }).bind('blur keyup paste copy cut mouseup ondrag selectionchange input', function () { //detect any change to the verse area
        if (verseAreaText != $verseArea.text()) {
            Chords.refresh();
            Verse.update();
        }
    });
    // Toggle Edit Button
    $toggleEditButton.click(function () {
        toggleEditMode();
    });
    // Edit Song Properties
    $editSongPropertiesButton.click(function () {
        var $songPopertiesModal = createModal('Song Properties', '<div class="row"><div class="input-field col s6"><input id="song-title" type="text" class="validate"><label for="song-title">Title</label></div><div class="input-field col s6"><input id="song-subtitle" type="text" class="validate"><label for="song-subtitle">Subtitle</label></div><div class="input-field col s6"><input id="song-index" type="number" min="0" max="1000" class="validate"><label for="song-index">Index</label></div><div class="input-field col s6"><input type="text" id="autocomplete-book" class="autocomplete"><label for="autocomplete-book">Book</label></div></div>');
        $('body').append($songPopertiesModal);
        var $songTitle = $('#song-title'),
			$songSubtitle = $('#song-subtitle'),
			$songIndex = $('#song-index'),
			$autocompleteBook = $('#autocomplete-book');
        $songTitle.val(CurrentSong.title);
        $songSubtitle.val(CurrentSong.subtitle);
        $songIndex.val(CurrentSong.index);
        $autocompleteBook.val(CurrentSong.book.title);
        Materialize.updateTextFields();
        $songPopertiesModal.modal({
            complete: function () {
                if ($('#song-title').val()) {
                    CurrentSong.title = $songTitle.val();
                    CurrentSong.subtitle = $songSubtitle.val();
                    CurrentSong.index = $songIndex.val();
                    CurrentSong.book.title = $autocompleteBook.val();
                    $(this).remove();
                    SaveSong(CurrentSong);
                } else $(this).remove();
            }
        });
        $songPopertiesModal.modal('open');
        console.log(Library.books);
        var autoCompleteBooks = '{', i;
        for (i = 0; i < Library.books.length; i++)
        {
            console.log(Library.books[i].image);
            autoCompleteBooks += '"' + Library.books[i].title + '": ';
            if (Library.books[i].image)
                autoCompleteBooks += '"' + Library.books[i].image + '"';
            else
              autoCompleteBooks += 'null';

            if (i + 1 < Library.books.length)
                autoCompleteBooks += ', ';
        }
        autoCompleteBooks += '}';
        console.log(autoCompleteBooks);
        var booksJson = JSON.parse(autoCompleteBooks);
        
        $autocompleteBook.autocomplete({
            data: booksJson,
            limit: 5
        });
    });
    // Save Song Button
    $saveSongButton.click(function () {
        saveButton();
    });
    // Verse Menu Button
    $('.verse-menu-collapse').click(function () {
        Verse.updateMenu();
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////
}

function createModal(title, contents, position) {
    if (position == 'bottom') return $('<div id="' + title + '" class="modal bottom-sheet"><div class="modal-content"><h4>' + title + '</h4><p>' + contents + '</p></div><div class="modal-footer"><a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Okay</a></div></div>');
    else return $('<div id="' + title + '" class="modal"><div class="modal-content"><h4>' + title + '</h4><p>' + contents + '</p></div><div class="modal-footer"><a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Okay</a></div></div>');
}

function SaveSong(song) {
    if (previouslySaved) runSave(song);
    else {
        var URL;
        if (song.book.title != '') // If song is in a book
            URL = 'library/' + song.book.title + '/' + song.title + '.json';
        else URL = 'library/' + song.title + '.json';
        $.ajax({
            url: URL,
            type: 'HEAD',
            error: function () {
                runSave(song);
            },
            success: function () {
                // If this is a new song and file already exists
                var $replaceSongModal = createModal('Replace Song', '<p>A song with the title ' + song.title + ' already exists in ' + song.book.title + '. Would you like to replace it?</p>');
                $('body').append($replaceSongModal);
                $replaceSongModal.modal({
                    complete: function () {
                        runSave(song);
                        $(this).remove();
                    }
                });
                $replaceSongModal.modal('open');
            }
        });
    }
}

function runSave(song) {
    Chords.refresh();
    Verse.update();
    var data = JSON.stringify(CurrentSong);
    $.ajax({
        url: 'Scripts/post.php',
        crossDomain: true,
        type: 'POST',
        data: {
            data: data
        },
        success: function (result) {
            Materialize.toast('Song Saved', 2000);
            if (!previouslySaved) {
                Library.addSong(song);
                previouslySaved = true;
            }
        }
    });
}

function saveButton() {
    if ($verseArea.attr('contenteditable')) {
        if (CurrentSong.title) {
            SaveSong(CurrentSong);
        } else if (!$('#saveModal').length) {
            var $saveModal = createModal('Save As', '<p>Please name the song.</p><p><input id="song-title" type="text" class="validate"><label for="song-title">Song Title</label></p>');
            $('body').append($saveModal);
            $saveModal.modal({
                complete: function () {
                    if ($('#song-title').val()) {
                        CurrentSong.title = $('#song-title').val();
                        $(this).remove();
                        SaveSong(CurrentSong);
                    } else $(this).remove();
                }
            });
            $saveModal.modal('open');
        }
    }
}

function toggleEditMode() {
    if ($verseArea.attr('contenteditable')) {
        $verseArea.removeAttr('contenteditable');
        $verseArea.css({
            'user-select': 'none',
            'border': 'none',
            'cursor': 'context-menu'
        });
        $content.css('min-height', '100%');
        $('header').css({'position': 'absolute', 'width': '100%'});
        $('header').animate({ 'top': '-' + $('header').height() + 'px' }, 250);
        $('.has-chord').css('background', 'none');
    } else {
        $verseArea.attr('contenteditable', 'true');
        $verseArea.removeAttr('style');
        $content.css({ 'min-height': 'calc(100% - 64px)', 'overflow': 'auto' });
        $('header').removeAttr('style');
        $('.has-chord').removeAttr('style');
    }
    Chords.refresh();
}

function makeXPath (node, currentPath) {
    /* this should suffice in HTML documents for selectable nodes, XML with namespaces needs more code */
    currentPath = currentPath || '';
    switch (node.nodeType) {
        case 3:
        case 4:
            return makeXPath(node.parentNode, 'text()[' + (document.evaluate('preceding-sibling::text()', node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']').replace(PRE_XPATH, '');
        case 1:
            return makeXPath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + (currentPath ? '/' + currentPath : '')).replace(PRE_XPATH, '');
        case 9:
            return ('/' + currentPath).replace(PRE_XPATH, '');
        default:
            return '';
    }
}

function restoreSelectionRange(selectionDetails) {
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(document.evaluate(PRE_XPATH + selectionDetails.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails.startOffset));
    range.setEnd(document.evaluate(PRE_XPATH + selectionDetails.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails.endOffset));
    return range;
}

function getSelectionX() {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var selectObj = { 
        'XPath': makeXPath(range.startContainer), 
        'startOffset': range.startOffset, 
        'endOffset': range.endOffset 
    }

    return selectObj
}

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructors
//////////////////////////////////////////////////////////////////////////////////////////////////////
var ContextMenu = {
    update: function () {
        $contextMenu.html('');
        var i;
        for (i = 0; i < menuItems.length; i++) {
            var $listItem = $('<li>' + menuItems[i].name + '</li>');
            $contextMenu.append($listItem);
            $listItem.mousedown(menuItems[i].action);
        }
    },
    display: function (x, y) {
        if (x > $(window).width() - $contextMenu.width())
            x = x - $contextMenu.width();
        if (y > $(window).height() - $contextMenu.height())
            y = y - $contextMenu.height();
        $contextMenu.css('left', x + 'px');
        $contextMenu.css('top', y + 'px');
        $contextMenu.css('display', 'block');
    },
    show: function(x, y, menu)
    {
        menuItems = menu;
        this.display(x, y);
        this.update();
    },
    hide: function () {
        $contextMenu.css('display', 'none');
    }
}

var Chords = {
    add: function (chord) {
        var span = document.createElement("span"),
            chordIndex = $('.chord').length;
        $(span).attr('class', 'has-chord');
        $(span).attr('id', 'chord-word-' + chordIndex);
        $verseArea.attr('contenteditable', 'true');

        var range = restoreSelectionRange(chord.Range);

        range.surroundContents(span);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);

        var $chord = $('<div class="chord" id="chord-' + chordIndex + '">' + chord.ChordText + '</div>');
        $('#verse-area').append($chord);

        CurrentSong.verses[verseIndex].chords.push(chord);

        this.refresh();
    },
    addToHTML: function() {
        var i;
        $('.chord').remove(); // Remove all chords before adding new ones.
        // Iterate through chords
        for(i = 0; i < CurrentSong.verses[verseIndex].chords.length; i++)
        {
            var chord = CurrentSong.verses[verseIndex].chords[i],
            span = document.createElement("span");
            $(span).attr('class', 'has-chord');
            $(span).attr('id', 'chord-word-' + i);
            $verseArea.attr('contenteditable', 'true');

            var range = restoreSelectionRange(chord.Range);

            range.surroundContents(span);
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(range);

            var $chord = $('<div class="chord" id="chord-' + i + '">' + chord.ChordText + '</div>');
            $('#verse-area').append($chord);
        }
    },
    remove: function(index) {
        CurrentSong.verses[verseIndex].chords.splice(index, 1);
        $('#chord-word-' + index).replaceWith($('#chord-word-' + index).text());
        $('#chord-' + index).remove();
        this.refresh();
    },
    refresh: function () {
        var chords = $(".chord"),
            chordWords = $(".has-chord"),
            lines = $("#verse-area p").toArray(),
            updatedChords = new Array(),
            i;

        // Check for missing chord words
        for (i = 0; i < chords.length; i++) {
            var matchingWord = $('#chord-word-' + $(chords[i]).attr('id').replace('chord-', ''));
            if (!matchingWord.attr('id')) // If no matching word is found
                $(chords[i]).remove();
        }

        // Loop through the chords in html to re-order them
        for (i = 0; i < CurrentSong.verses[verseIndex].chords.length; i++) {
            var $chordWord = $(chordWords.get(i));
            if ($chordWord.attr('id')) {
                $chord = $('#chord-' + $chordWord.attr('id').replace('chord-word-', ''));
                $chordWord.attr('id', 'chord-word-' + i);
                $chord.attr('id', 'chord-' + i);

                if ($chordWord.parent().contents().filter(function () { return this.nodeType == 3; })[$chordWord.index()]) {
                    var startOffset = $chordWord.parent().contents().filter(function () { return this.nodeType == 3; })[$chordWord.index()].nodeValue.length;
                    var range = {
                        'XPath': 'P[' + ($chordWord.parent().index() + 1) + ']/text()[' + ($chordWord.index() + 1) + ']',
                        'startOffset': startOffset,
                        'endOffset': startOffset + $chordWord.text().length
                    }
                    var newChord = {
                        ChordText: $chord.text(),
                        Range: range
                    };
                    updatedChords.push(newChord);
                }
            }
        }
        // replace chord data with re-ordered chords
        CurrentSong.verses[verseIndex].chords = updatedChords;

        // Update line margins for chords
        for (i = 0; i < lines.length; i++) {
            var $line = $(lines[i]);
            if ($line.find($('.has-chord')).length > 0) 
                $line.attr('class', 'contains-chord');
            else
                $line.removeAttr('class');
        }

        // Loop through the chords to reposition them.
        var $chordWords = $('.has-chord');
        for (i = 0; i < $chordWords.length; i++) {
            if ($($chordWords[i]).attr('id')) {
                var $chordWord = $($chordWords[i]),
                $chord = $('#chord-' + $chordWord.attr('id').replace('chord-word-', '')),
                pos = $chordWord.position(),
                width = $chordWord.width(),
                height = $chordWord.height(),
                chordWidth = $chord.width();

                // Update chord position
                $chord.css({'left': (pos.left + (width / 2) - (chordWidth / 2)) + 'px', 'top': (pos.top - (height / 2)) + 'px'})
            }
        }

        // Add Chord Word Events
        $('.has-chord').contextmenu(function (e) {
            lastSelectedChord = $(this).attr('id').replace('chord-word-', '');
            if ($verseArea.attr('contenteditable')) ContextMenu.show(e.pageX, e.pageY, chordWordContextItems);
            return false;
        });
    }
}

var Verse = {
    add: function () {
        if ($verseArea.attr('contenteditable')) {
            if (CurrentSong.verses.length > 0)
                Verse.update();
            var newVerse = new verse('<p>Type verse here.</p>');
            CurrentSong.verses.push(newVerse);
            Verse.changeToIndex(CurrentSong.verses.length - 1);
            Verse.updateMenu();
        }
    },
    remove: function () {
        if ($verseArea.attr('contenteditable')) {
            CurrentSong.verses.splice(lastSelectedVerse, 1);
            if (verseIndex > 0) verseIndex--;
            if (CurrentSong.verses.length <= 0)
                this.add();
            Verse.updateMenu();
            this.update();
        }
    },
    duplicate: function() {
        CurrentSong.verses.splice(lastSelectedVerse, 0, CurrentSong.verses[lastSelectedVerse]);
        console.log(CurrentSong.verses);
        this.updateMenu();
    },
    moveUp: function () {
        if(lastSelectedVerse > 0) // If the selected verse is not first
        {
            if (verseIndex == lastSelectedVerse)
                verseIndex = lastSelectedVerse - 1;
            else if (verseIndex == lastSelectedVerse - 1)
                verseIndex = verseIndex + 1;

            CurrentSong.verses.move(lastSelectedVerse, lastSelectedVerse - 1);
            
            this.updateMenu();
        }
    },
    moveDown: function () {
        if (lastSelectedVerse < CurrentSong.verses.length - 1) // If the selected verse is not the last
        {
            if (verseIndex == lastSelectedVerse)
                verseIndex = lastSelectedVerse + 1;
            else if (verseIndex == lastSelectedVerse + 1)
                verseIndex = verseIndex - 1;

            CurrentSong.verses.move(lastSelectedVerse, lastSelectedVerse + 1);
            
            this.updateMenu();
        }
    },
    changeToIndex: function (index) {
        // Update current verse button to html without chord words
        Verse.update();
        verseIndex = index;
        $verseArea.html(CurrentSong.verses[index].html);
        Chords.addToHTML();
        Chords.refresh();
    },
    update: function () { // Saves the current verse into the song data
        Chords.refresh();
        var $copy = $verseArea.clone();
        $copy.find('span').replaceWith(function () { return $(this).text(); });
        $copy.find('.contains-chord').replaceWith(function () { return '<p>' + $(this).html() + '</p>'; });
        CurrentSong.verses[verseIndex].html = $copy.html();
    },
    updateMenu: function () {
        Verse.update();

        $('#verse-menu').html(''); // Clear verse menu

        // Iterate through verses and create buttons for each
        var i;
        for (i = 0; i < CurrentSong.verses.length; i++) {
            var selectedClass = '';
            if (i == verseIndex) selectedClass = 'selected';
            var $menuButton = $('<div class="verse-container button-container ' + selectedClass + '" id="verse-button-' + i + '"><div class="verse-menu-button">' + CurrentSong.verses[i].html + '</div></div>');
            $('#verse-menu').append($menuButton);
        }

        // Add events for verse buttons
        $('.button-container').click(function () {
            // Set clicked button to selected
            $('.button-container').attr('class', 'verse-container button-container');
            $(this).addClass('selected');
            
            // Set verse to nearest button to mouse
            Verse.changeToIndex($(this).closest('.button-container').index('.button-container'));
        });

        $('#verse-menu').contextmenu(function (e) {
            if (e.target.id == 'verse-menu')
                ContextMenu.show(e.pageX, e.pageY, verseMenuContextItems);
            else {
                lastSelectedVerse = parseInt(e.target.id.replace('verse-button-', ''));
                ContextMenu.show(e.pageX, e.pageY, verseButtonContextItems);
            }
        });
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
verseEditInit();