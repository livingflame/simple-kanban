$(document).ready(function () {
    var converter = new showdown.Converter();
    converter.setFlavor('github');
    converter.setOption('simpleLineBreaks',false);

    var hidden_div = $(document.createElement('div'));
    hidden_div.addClass('hiddendiv');

    var kanban = $.kanban({
        api_url:'server.php',
        converter:converter,
        hidden_div:hidden_div
    });
});