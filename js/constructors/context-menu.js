var $dropdownButton = $('.dropdown-button');

$dropdownButton.dropdown({
    constrainWidth: false
});

var ContextMenu = {
    update: function (x, y) {
        $contextMenu.html('');
        var i;
        for (i = 0; i < menuItems.length; i++) {
            var $listItem = $('<li><a href="#!">' + menuItems[i].name + '</a></li>');
            $contextMenu.append($listItem);
            $listItem.mousedown(menuItems[i].action);
        }

        if (x > $(window).width() - $contextMenu.width())
            x = x - $contextMenu.width();
        if (y > $(window).height() - $contextMenu.height())
            y = y - $contextMenu.height();
        $contextMenu.css('left', (x - 15) + 'px');
        $contextMenu.css('top', (y - 15) + 'px');
    },
    show: function (x, y, menu) {
        menuItems = menu;
        $dropdownButton.dropdown('open');
        this.update(x, y);
    },
    hide: function () {
        $dropdownButton.dropdown('close');
    }
}