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
var	$verseContainer = $('<div class="verse-container"></div>'),
	$verseArea = $('<div contenteditable="true" tabindex="0" id="verse-area"></div>'),
	$verseMenu = $('<div id="verse-menu" class="side-nav"></div>'),
	$verseMenuButton = $('<li><a href="#" data-activates="verse-menu" data-position="bottom" data-tooltip="Open the verse drawer" class="verse-menu-collapse tooltipped"><i class="material-icons">&#xE03D;</i></a></li>'),
	$editSongPropertiesButton = $('<li><a href="#" data-position="bottom" data-tooltip="Edit properties" class="tags-button tooltipped"><i class="material-icons">label</i></a></li>'),
    $editSongTagsButton = $('<li><a href="#" data-position="bottom" data-tooltip="Edit tags" class="tags-button tooltipped"><i class="material-icons">&#xE54E;</i></a></li>'),
    $saveSongButton = $('<li><a href="#" data-position="bottom" data-tooltip="Save" class="song-properties-button tooltipped"><i class="material-icons">&#xE161;</i></a></li>'),
	$toggleMode = $('<li><a href="#" data-position="bottom" data-tooltip="Display Mode" class="toggle-edit-button tooltipped"><i class="material-icons">&#xE063;</i></a></li>'),
	$textBox;

//  Workable  Song
var CurrentSong = new Song();

//  Integers
var verseIndex = -1,
    lastSelectedChord,
    lastSelectedVerse,
    lastSelectedInstruction,
	range,
    verseAreaText,
	paragraphCount;

//  Booleans
var previouslySaved = false,
    changesMade = false,
    editMode = false;

// Constants
var PRE_XPATH = '/HTML[1]/BODY[1]/DIV[1]/DIV[1]/DIV[1]/';

// Chord Data
var chordsText = '{ }';

//  Menu Items
var menuItemAddChord = {
    name: 'Add Chord',
    action: function () {
        range = getSelectionX();
        var $chordModal = createModal("Add Chord", '<input type="text" id="chord-autocomplete" class="autocomplete">', '<a href="#!" class="modal-action modal-close waves-effect waves-light-green btn-flat ">Okay</a>', 'bottom');
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
            var $chordModal = createModal("Change Chord", '<input type="text" id="chord-autocomplete" class="autocomplete">', '<a href="#!" class="modal-action modal-close waves-effect waves-light-green btn-flat ">Okay</a>', 'bottom');
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
    menuItemMakeInstruction = {
        name: 'Make Instruction',
        action: function () {
            range = getSelectionX();
            Instructions.add(range);
        }
    },
    menuItemMakeText = {
        name: 'Make Text',
        action: function () {
            Instructions.remove();
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
    menuItemAddMirror = {
        name: 'Add Mirror Verse',
        action: function () {
            Verse.add(lastSelectedVerse);
        }
    },
    menuItemToggleVisibility = {
        name: 'Toggle Visibility',
        action: function () {
            Verse.toggleVisibilty();
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
    verseContextItems = [menuItemAddChord, menuItemMakeInstruction],
    verseMenuContextItems = [menuItemAddVerse],
    verseButtonContextItems = [menuItemAddVerse, menuItemRemoveVerse, menuItemDuplicateVerse, menuItemAddMirror, menuItemToggleVisibility],
    chordWordContextItems = [menuItemRemoveChord, menuItemChangeChord],
    instructionMenuContextItems = [menuItemMakeText];

// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////
function verseEditInit() {
    // Add verse area to the page
    $verseContainer.append($verseArea);
    $dropdownButton.dropdown({
        constrainWidth: true,
        gutter: '5px'
    })
}

function loadVerseEditScreen(song) {
    // Update Styles
    $body.css('background-color', 'black');
    $content.css({
        'display': 'flex',
        'flex-direction': 'row',
        'align-items': 'stretch',
        'min-height': 'calc(100% - 64px)',
        'margin': 'auto',
        'width': '100%'
    });
    verseIndex = -1;
    // Add Elements to screen
    $body.append($verseMenu);
    $content.append($verseContainer);
    $('#header-menu').append($toggleMode).append($editSongPropertiesButton).append($editSongTagsButton).append($saveSongButton).append($verseMenuButton);
    if (song) {
        previouslySaved = true;
        CurrentSong = song;
        Verse.changeToIndex(0);
        GoToDisplayMode();
    } else {
        previouslySaved = false;
        CurrentSong = new Song();
        CurrentSong.appendVerse('<p>Type verse here.</p>');
        Verse.changeToIndex(0);
    }
    $('.verse-menu-collapse').sideNav({
        menuWidth: 200,
        edge: 'right'
    });
    $('.tooltipped').tooltip({
        delay: 50
    });
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
                    $saveSongButton.click();
                    return false;
                }
                    // Toggle Edit Mode
                else if (String.fromCharCode(e.which).toLowerCase() === 'e') {
                    $toggleMode.click();
                    return false;
                }
            }
            if (!editMode) { // If not in edit mode
                if (e.keyCode == 37) // left
                {
                    if (verseIndex > 0)
                        Verse.changeToIndex(verseIndex - 1);
                }
                else if (e.keyCode == 39) // right
                {
                    if (verseIndex < CurrentSong.verses.length - 1)
                        Verse.changeToIndex(verseIndex + 1);
                }
                return false;
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
        $verseArea.contents().filter(function () { return this.nodeType === 3 }).wrap('<p/>'); // Wrap all empty text nodes with p tags
        $verseArea.find($('div').not('.chord')).replaceWith(function () { return $('<p/>', { html: this.innerHTML }); }); // Replace any div elements not chords with p elements
        $verseArea.find($('span').not('.has-chord').not('.instruction').replaceWith(function () { return this.innerHTML }));

        // Loop through paragraphs and merge any text nodes
        var paragraphs = $verseArea.find('p').toArray();
        for (var i = 0; i < paragraphs.length; i++)
        {
            paragraphs[i].normalize();
        }

        Verse.update();
    });
    // Edit Song Properties
    $editSongPropertiesButton.click(function () {
        var $songPopertiesModal = createModal('Song Properties', '<div class="row"><div class="input-field col s6"><input id="song-title" type="text" class="validate"><label for="song-title">Title</label></div><div class="input-field col s6"><input id="song-subtitle" type="text" class="validate"><label for="song-subtitle">Subtitle</label></div></div><div class="row"><div class="input-field col s6"><input id="song-index" type="number" min="0" max="1000" class="validate"><label for="song-index">Index</label></div><div class="input-field col s6"><input type="text" id="autocomplete-book" class="autocomplete"><label for="autocomplete-book">Book</label></div></div>', '<a href="#!" class="modal-action modal-close waves-effect waves-light-green btn-flat">Okay</a>');
        $body.append($songPopertiesModal);
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
            dismissible: false,
            complete: function () {
                if ($('#song-title').val()) {
                    CurrentSong.title = $songTitle.val();
                    CurrentSong.subtitle = $songSubtitle.val();
                    CurrentSong.index = $songIndex.val();
                    CurrentSong.book.title = $autocompleteBook.val();
                    $(this).remove();
                    saveSong(CurrentSong);
                } else $(this).remove();
            }
        });
        $songPopertiesModal.modal('open');
        $autocompleteBook.autocomplete({
            data: Library.booksAsAutocomplete(),
            limit: 5
        });
    });
    // Save Song Button
    $saveSongButton.click(function () {
        Verse.update();
        if ($verseArea.attr('contenteditable')) {
            if (CurrentSong.title) {
                saveSong(CurrentSong);
            } else if (!$('#saveModal').length) {
                var $saveModal = createModal('Save As', '<p>Please name the song.</p><p><input id="song-title" type="text" class="validate"><label for="song-title">Song Title</label></p>', '<a href="#!" class="modal-action modal-close waves-effect waves-light-green btn-flat ">Save</a><a href="#!" class="modal-action modal-close waves-effect waves-light-green btn-flat ">Cancel</a>');
                $body.append($saveModal);
                $saveModal.modal({
                    complete: function () {
                        if ($('#song-title').val()) {
                            CurrentSong.title = $('#song-title').val();
                            $(this).remove();
                            checkIfSongExsists(CurrentSong);
                        } else $(this).remove();
                    }
                });
                $saveModal.modal('open');
            }
        }
    });
    // Verse Menu Button
    $('.verse-menu-collapse').click(function () {
        Verse.updateMenu();
    });
    // Edit Mode Button
    $toggleMode.click(function () {
        $('.material-tooltip').remove();
        if(editMode)
            GoToDisplayMode();
        else // display mode
            GoToEditMode();

        $('.tooltipped').tooltip({ delay: 50 });
    });
    // Edit Tags Button
    $editSongTagsButton.click(function () {
        var $editTagsModal = createModal('Edit Tags', '<div class="chips"></div>', '<a href="#!" class=" modal-action modal-close waves-effect waves-light-green btn-flat">Done</a>');
        $body.append($editTagsModal);
        $editTagsModal.modal({
            ready: function () {
                $('.chips').material_chip({
                    data: CurrentSong.tags,
                    placeholder: 'Enter a tag',
                    secondaryPlaceholder: '+Tag',
                    autocompleteData: Library.tagsAsAutocomplete()
                });
            },
            complete: function () {
                var c;
                for (c = 0; c < $('.chip').length; c++) // Loop through chips
                {
                    var chipText = $($('.chip')[c]).text();
                    chipText.substring(0, chipText.length - 5); // Remove "Close" text
                    if(!ArrayContainsID(CurrentSong.tags, chipText)) // Checks if tag was already added to song.
                    {
                        var tag = { tag: chipText };
                        CurrentSong.tags.push(tag); // Add tag to Song
                        Library.addTag(tag); // add tag to library
                    }
                }
                $editTagsModal.remove();
            },
        });
        $editTagsModal.modal('open');
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////
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
    var range = document.createRange(),
        node = document.evaluate(PRE_XPATH + selectionDetails.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    range.setStart(document.evaluate(PRE_XPATH + selectionDetails.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails.startOffset));
    var end = Number(selectionDetails.endOffset);
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

function GoToDisplayMode() {
    if (changesMade) {
        var ConfirmSave = createModal('Changes were made', '<h6>Would you like to save?</h6>', '<a href="#!" id="confirm-save-btn" class=" modal-action modal-close waves-effect waves-light-green btn-flat">Yes</a><a href="#!" class=" modal-action modal-close waves-effect waves-light-green btn-flat">No</a>');
        $body.append(ConfirmSave);
        ConfirmSave.modal({
            dismissible: false,
            ready: function () {
                $('#confirm-save-btn').click(function () {
                    saveSong(CurrentSong);
                    changesMade = false;
                    UpdateHTMLToDisplay();
                });
            },
            complete: function () {
                changesMade = false;

                UpdateHTMLToDisplay();
            }
        });
        ConfirmSave.modal('open');
    }
    else {
        UpdateHTMLToDisplay();
    }
}

function UpdateHTMLToDisplay() {
    $toggleMode.html('<a href="#" data-position="bottom" data-tooltip="Edit Mode" class="toggle-edit-button tooltipped"><i class="material-icons">&#xE254;</i></a>');
    $verseMenuButton.css('display', 'none');
    $saveSongButton.css('display', 'none');
    $editSongPropertiesButton.css('display', 'none');
    $editSongTagsButton.css('display', 'none');
    UpdateSearchBar();

    $verseArea.removeAttr('contenteditable');
    $verseArea.css({ 'border': 'none', 'user-select': 'none', 'cursor': 'default' });
    $body.css('overflow', 'hidden');
    editMode = false;
    NavBar.hide();
}

function GoToEditMode() {
    $verseMenuButton.removeAttr('style');
    $saveSongButton.removeAttr('style');
    $editSongPropertiesButton.removeAttr('style');
    $editSongTagsButton.removeAttr('style');
    UpdateSearchBar();

    $toggleMode.html('<a href="#" data-position="bottom" data-tooltip="Display Mode" class="toggle-edit-button tooltipped"><i class="material-icons">&#xE063;</i></a>');
    $verseArea.attr('contenteditable', 'true');
    $verseArea.removeAttr('style');
    $('.has-chord').removeAttr('style');
    $body.css('overflow', 'visible');
    editMode = true;
    NavBar.show();
}

$(document).mousemove(function (e) {
    if (!editMode) { // If user is in view mode
        if (e.clientY < $('nav').height())
            NavBar.show();
        else if (e.clientY > $('nav').height())
            NavBar.hide();
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructors
//////////////////////////////////////////////////////////////////////////////////////////////////////
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
        var chords;
        if (CurrentSong.verses[verseIndex].mirror > -1 && CurrentSong.verses[verseIndex].mirror != null)
            chords = CurrentSong.verses[CurrentSong.verses[verseIndex].mirror].chords;
        else
            chords = CurrentSong.verses[verseIndex].chords;
        for(i = 0; i < chords.length; i++)
        {
            var chord = chords[i],
            span = document.createElement("span");
            $(span).attr('class', 'has-chord');
            $(span).attr('id', 'chord-word-' + i);

            var range = restoreSelectionRange(chord.Range);
            range.surroundContents(span);
            document.getSelection().removeAllRanges();

            var $chord = $('<div class="chord" id="chord-' + i + '">' + chord.ChordText + '</div>');
            $('#verse-area').append($chord);
        }
        if(!editMode)
            $verseArea.css('user-select', 'none');
        Chords.refresh();
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
        if (CurrentSong.verses.length && CurrentSong.verses[verseIndex].chords.length) {
            var chordAtBeginning = false;
            var previousParagraph = 0;
            for (i = 0; i < CurrentSong.verses[verseIndex].chords.length; i++) {
                var $chordWord = $(chordWords[i]);
                if ($chordWord.attr('id')) {
                    $chord = $('#chord-' + $chordWord.attr('id').replace('chord-word-', ''));
                    $chordWord.attr('id', 'chord-word-' + i);
                    $chord.attr('id', 'chord-' + i);

                    var startOffset,
                        chordIndex = $chordWord.index(),
                        newParagraph = ($chordWord.parent().index() + 1),
                        nodeIndex = 0;

                    if (newParagraph != previousParagraph) // A new paragraph has started
                    {
                        previousParagraph = newParagraph
                        chordAtBeginning = false;
                    }

                    nodeIndex = chordIndex;

                    if (chordAtBeginning) // If the first chord starts at the beginning, subtract one for the text node index.
                        nodeIndex--;

                    if ($chordWord.map(function () {
                        if (this.previousSibling)
                            return this.previousSibling.nodeValue
                        else
                            return null
                    })[0]) // If there is text before chord word
                        startOffset = $chordWord.parent().contents().filter(function () { return this.nodeType == 3; })[nodeIndex].nodeValue.length;
                    else
                    {
                        startOffset = 0;
                        chordAtBeginning = true;
                    }

                    var range = {
                        'XPath': 'P[' + newParagraph + ']/text()[' + (chordIndex + 1) + ']',
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
                    $chord.css({ 'left': (pos.left + (width / 2) - (chordWidth / 2)) + 'px', 'top': (pos.top - (height / 2)) + 'px' });
                }
            }

            // Add Chord Word Events
            $('.has-chord').contextmenu(function (e) {
                lastSelectedChord = $(this).attr('id').replace('chord-word-', '');
                if ($verseArea.attr('contenteditable')) ContextMenu.show(e.pageX, e.pageY, chordWordContextItems);
                return false;
            });
        }

        if (!editMode) {
            $('.has-chord').css('background', 'none');
            $verseArea.css('user-select', 'none');
        }
    }
}

var Instructions = {
    add: function (selectedRange) {
        var span = document.createElement("span");
        $(span).attr('class', 'instruction');

        var range = restoreSelectionRange(selectedRange);

        range.surroundContents(span);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);

        $('.instruction').contextmenu(function (e) {
            ContextMenu.show(e.pageX, e.pageY, instructionMenuContextItems);
            lastSelectedInstruction = $(this);
        });
    },
    remove: function () {
        lastSelectedInstruction.replaceWith(lastSelectedInstruction.text());
    }
}

var Verse = {
    add: function (mirror) {
        if ($verseArea.attr('contenteditable')) {
            var newVerse = new verse();
            if (mirror != undefined) {
                newVerse = $.extend(true, {}, CurrentSong.verses[mirror]);
                newVerse.mirror = mirror;
            }
            if (!lastSelectedVerse || lastSelectedVerse > CurrentSong.verses.length - 1) {
                lastSelectedVerse = CurrentSong.verses.length - 1;
                CurrentSong.verses.push(newVerse);
            }
            else
                CurrentSong.verses.splice(lastSelectedVerse + 1, 0, newVerse);
            if(mirror == undefined)
                Verse.changeToIndex(lastSelectedVerse + 1);
            Verse.updateMenu();
        }
    },
    remove: function () {
        if ($verseArea.attr('contenteditable')) {

            $('#verse-button-' + lastSelectedVerse).remove();

            if ($('.button-container').length <= 0) {
                CurrentSong.verses[0].html = 'Type verse here.';
                $verseArea.html(CurrentSong.verses[0].html);
                console.log(CurrentSong.verses);
                this.updateMenu();
            }
            else
                this.updateOrderFromMenu();
        }
    },
    duplicate: function () {
        $('#verse-menu').append($($('.button-container')[lastSelectedVerse]).clone());
        this.updateOrderFromMenu();
    },
    toggleVisibilty: function () {
        console.log(lastSelectedVerse);
        if (CurrentSong.verses[lastSelectedVerse].display == undefined || CurrentSong.verses[lastSelectedVerse].display == true)
            CurrentSong.verses[lastSelectedVerse].display = false;
        else
            CurrentSong.verses[lastSelectedVerse].display = true;
        this.updateMenu();
    },
    allowDrop: function(e) {
        e.preventDefault();
    },
    drag: function (e) {
        var $verseButton = $('#' + e.target.id),
            offsetY = e.pageY - $verseButton.position().top,
            height = $verseButton.height(),
            margin = parseInt($verseButton.css('margin')); // Get to offset to the top of the button

        // Wait for a frame to pass so a copy can be made before making the button invisible
        window.requestAnimationFrame(function () {
            $verseButton.css('opacity', '0');
        });
        e.dataTransfer.setData("verse", e.target.id);

        // Event for while dragging
        $verseButton.on('drag', function (e) {
            var elementTopY = e.pageY - offsetY,
                $previousButton = $($('.button-container')[$verseButton.index() - 1]),
                $nextButton = $($('.button-container')[$verseButton.index() + 1]);

            // Check if dragged element is above previous button or after next

            if($previousButton.length && elementTopY < $previousButton.position().top) // If a previous button exists and the dragged verse button is above it
            {
                $previousButton.css('margin-bottom', height + (margin * 2) + 'px');
                $verseButton.css({ 'height': '0px', 'margin': '0px' });

                $verseButton.insertBefore($previousButton); // Moved dragged verse before

                $previousButton.animate({ marginBottom: margin + 'px' }, 250);
                $verseButton.animate({ 'height': height + 'px', 'margin': margin + 'px' }, 250);
            }
            else if ($nextButton.length && elementTopY > $nextButton.position().top) // If a next button exists and the dragged verse is below it
            {
                // Animate verse transition

                $nextButton.css('margin-top', 100 + (margin*2) + 'px');
                $verseButton.css({ 'height': '0px', 'margin': '0px' });

                $verseButton.insertAfter($nextButton); // Move dragged verse after

                $nextButton.animate({ marginTop: margin + 'px' }, 250);
                $verseButton.animate({ 'height': height + 'px', 'margin': margin + 'px' }, 250);
            }
        });
    },
    drop: function (e) {
        var data = e.dataTransfer.getData("verse");
        if (data) {
            Verse.updateOrderFromMenu();
            $('#' + data).animate({ 'opacity': '1' }, 10);
            e.preventDefault();
        }
    },
    changeToIndex: function (index) {
        // Update current verse button to html without chord words
        if(verseIndex != -1)
            Verse.update();
        verseIndex = index;
        if (CurrentSong.verses[verseIndex].mirror > -1 && CurrentSong.verses[verseIndex].mirror != null)
            $verseArea.html(CurrentSong.verses[CurrentSong.verses[verseIndex].mirror].html);
        else
            $verseArea.html(CurrentSong.verses[verseIndex].html);
        if (!editMode)
            $verseArea.css('user-select', 'none');
        Chords.addToHTML();
    },
    update: function () { // Saves the current verse into the song data
        verseAreaText = $verseArea.text();
        paragraphCount = $verseArea.find('p').length;
        Chords.refresh(); // Update chords
        var $copy = $verseArea.clone(); // Make a copy of the current verse
        $copy.find('span').not('.instruction').replaceWith(function () { return $(this).text(); }); // Remove all chord word formatting
        $copy.find('.contains-chord').replaceWith(function () { return '<p>' + $(this).html() + '</p>'; }); // remove line formatting
        $copy.find('.chord').remove(); // Remove all chords
        CurrentSong.verses[verseIndex].html = $copy.html(); // Save into data
        changesMade = true;
    },
    updateMenu: function () {
        Verse.update();

        $('#verse-menu').html(''); // Clear verse menu

        // Iterate through verses and create buttons for each
        var verseCount = 1;
        for (var i = 0; i < CurrentSong.verses.length; i++) {
            var classes = '';
            if (i == verseIndex) classes = 'selected';

            var labelHTML,
                verseHTML,
                verse = CurrentSong.verses[i];

            if (verse.mirror != undefined)
            {
                classes = 'mirror';
                labelHTML = '<span>' + (verse.mirror + 1) + '</span><i class="material-icons tiny">&#xE3B9;</i>';
                verseHTML = CurrentSong.verses[verse.mirror].html;
            }
            else
            {
                labelHTML = '<span>' + verseCount + '</span>';
                verseCount++;
                verseHTML = verse.html;
            }
            if(verse.display == "undefined" || verse.display == false)
                labelHTML = labelHTML + '<i class="material-icons tiny">&#xE8F5;</i>';

            var $menuButton = $('<div class="verse-container button-container ' + classes + '" id="verse-button-' + i + '" draggable="true" ondragstart="Verse.drag(event)"><div class="verse-menu-button">' + verseHTML + '</div><div class="verse-menu-label"><div>' + labelHTML + '</div></div>');
            $('#verse-menu').append($menuButton);
        }

        // Add events for verse buttons
        $('.button-container').not('.mirror').click(function () {
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
                var id;
                if (e.target.id)
                    id = e.target.id;
                else
                    id = $(e.target).parent().attr('id');
                lastSelectedVerse = parseInt(id.replace('verse-button-', ''));
                ContextMenu.show(e.pageX, e.pageY, verseButtonContextItems);
            }
        });
    },
    updateOrderFromMenu: function() {
        var selectedVerse = -1,
            newVerseArray = new Array();
        for (var i = 0; i < $('.button-container').length; i++) // Loop through verse buttons
        {
            var $buttonAtIndex = $($('.button-container')[i]), // This is the button going from top to bottom
                buttonsPreviousIndex = parseInt($buttonAtIndex.attr('id').replace('verse-button-', '')); // Gets where the button was before drag

            if ($buttonAtIndex.hasClass('selected')) // If this is the selected button
                selectedVerse = i;

            newVerseArray.push(CurrentSong.verses[buttonsPreviousIndex]); // push the verse at the previous location to the end of the new array
        }
        if (selectedVerse == -1) // If the selected verse was deleted
        {
            if (verseIndex >= newVerseArray.length) {
                Verse.changeToIndex(verseIndex - 1);
                selectedVerse = verseIndex;
            }
            else {
                Verse.changeToIndex(verseIndex + 1);
                selectedVerse = verseIndex - 1;
            }
        }
        CurrentSong.verses = newVerseArray;
        verseIndex = selectedVerse;
        this.updateMenu();
    }
}

var NavBar = {
    visible: true,
    show: function () {
        if (this.visible == false) {
            this.visible = true;
            $('nav').animate({ 'top': '0px' }, 250);
            $('.navbar-fixed').animate({ 'height': '64px' }, 250);
            $content.animate({ 'min-height': ($body.height() - 64) + 'px' }, {
                duration: 250, step: function () {
                    Chords.refresh();
                }
            });
        }
    },
    hide: function () {
        if (this.visible == true && !editMode && $('#search-results').css('display') == 'none') {
            this.visible = false;
            $('nav').animate({ 'top': '-' + $('nav').height() + 'px' }, 250);
            $('.navbar-fixed').animate({ 'height': '0px' }, 250, function () {
                Chords.refresh();
            });
            $content.animate({ 'min-height': $body.height() + 'px' }, {
                duration: 250, step: function () {
                    Chords.refresh();
                }
            });
        }
    }
}

$.fn.autoSizr = function () {
    var el, elements, _i, _len, _results;
    elements = $(this);
    if (elements.length < 0) {
        return;
    }
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        _results.push((function (el) {
            var resizeText, _results1;
            resizeText = function () {
                var elNewFontSize;
                elNewFontSize = (parseInt($(el).css('font-size').slice(0, -2)) - 1) + 'px';
                return $(el).css('font-size', elNewFontSize);
            };
            _results1 = [];
            while (el.scrollHeight > el.offsetHeight) {
                _results1.push(resizeText());
            }
            return _results1;
        })(el));
    }
    return $(this);
};
///////////////////////////////////////////////////////////////////////////////////////////////////
verseEditInit();