(function($){ // secure $ jQuery alias
$.funDrag = function(element,options){
    var container,el,mdown = false,isDragging = false,my_dragging = {};
    var settings = $.extend({
        selector: "",
		handle: "",
		dragEnd: function() { },
		dragBetween: true
    }, options);

    if (settings.selector.trim()) {
        if($(element + " > " + settings.selector).length > 0){
            el = element + " > " + settings.selector;

        } else {
            el = element;
 
        }
    }

    $('body').on('mousedown',el,function(e){
        my_dragging.pageX0 = e.pageX;
        my_dragging.pageY0 = e.pageY;
        my_dragging.elem = this;
        my_dragging.offset0 = $(this).offset();
        function handle_dragging(e){
            var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
            var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
            $(my_dragging.elem).offset({top: top, left: left});
        }
        function handle_mouseup(e){
            $('body').off('mousemove',el, handle_dragging);
            $('body').off('mouseup',el,handle_mouseup);
        }
        $('body').on('mouseup',el, handle_mouseup)
        $('body').on('mousemove',el, handle_dragging);
    });
}

})( jQuery ); // confine scope
$( document ).ready(function() {
    $.funDrag('ul.nav',{selector:'li'});
});
