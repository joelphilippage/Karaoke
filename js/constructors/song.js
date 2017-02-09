function Song()
{
    this.title = '';
    this.subtitle = '';
    this.index = 0;
    this.book = new Book();
    this.verses = new Array();
    this.tags = new Array();
    this.appendVerse = function (verseHTML) {
        this.verses.push(new verse(verseHTML));
    };
    this.prependVerse = function (verse) {
        this.verses.pop(new verse(verseHTML));
    };
}