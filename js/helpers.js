var $content = $('.content'),
	$body = $('body'),
    $contextMenu = $('#context-menu');

function createModal(title, contents, footer, position) {
    var modal;
    if (position == 'bottom') modal = $('<div id="' + title + '" class="modal bottom-sheet"><div class="modal-content"><h4>' + title + '</h4><p>' + contents + '</p></div><div class="modal-footer">' + footer + '</div></div>');
    else modal = $('<div id="' + title + '" class="modal"><div class="modal-content"><h4>' + title + '</h4><p>' + contents + '</p></div><div class="modal-footer">' + footer + '</div></div>');
    return modal;
}

function checkIfSongExists(song) {
    if (previouslySaved) saveSong(song);
    else {
        var URL;
        if (song.book.title != '') // If song is in a book
            URL = 'library/' + song.book.title + '/' + song.title.replace(':', '-') + '.json';
        else URL = 'library/' + song.title.replace(':', '-') + '.json';
        $.ajax({
            url: URL,
            type: 'HEAD',
            error: function () {
                saveSong(song);
            },
            success: function () {
                // If this is a new song and file already exists
                var $replaceSongModal = createModal('Replace Song', '<p>A song with the title ' + song.title + ' already exists in ' + song.book.title + '. Would you like to replace it?</p>', '<a href="#!" id="yes-button" class=" modal-action modal-close waves-effect waves-light-green btn-flat">Yes</a><a href="#!" class=" modal-action modal-close waves-effect waves-light-green btn-flat">No</a>');
                $('body').append($replaceSongModal);
                $replaceSongModal.modal({
                    dismissable: false,
                    ready: function() {
                        $("#yes-button").click(function () {
                            saveSong(song);
                            $(this).remove();
                        });
                    },
                    complete: function () {
                        $(this).remove();
                    }
                });
                $replaceSongModal.modal('open');
            }
        });
    }
}

function saveSong(song) {
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
                changesMade = false;
            }
        }
    });
}

function UpdateSearchBar() {
    $('.search-form').attr('style', 'margin: 0 ' + $('#header-menu').outerWidth(true) + 'px 0 ' + ($('#menu-activation').outerWidth(true) + $('.brand-logo').outerWidth(true) + 25) + 'px;');
}

function ArrayContainsID(array, property) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i]) {
            if (array[i].title) {
                if (array[i].title == property)
                    return true;
            }
            else if (array[i].tag.length) {
                if (array[i].tag == property)
                    return true;
            }
        }
    }
    return false;
}

function arrayContainsAnotherArray(needle, haystack) {
    for (var i = 0; i < needle.length; i++) {
        if (haystack.indexOf(needle[i]) === -1)
            return false;
    }
    return true;
}