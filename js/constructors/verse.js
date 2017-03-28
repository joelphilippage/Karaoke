function verse(html) {
    if (html == null)  
        this.html = '<p>Type verse here.</p>';
    else
        this.html = html;
    this.chords = new Array();
    this.mirror = null;
    this.display = true;
}