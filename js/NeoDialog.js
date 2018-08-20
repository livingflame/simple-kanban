(function ( $ ) {
    "use strict";
    
    $.xDialog = function(){
        var isset = function (arr){
            if (typeof arr !== 'undefined' && arr !== null) {
                return true;
            }
            return false;
        };

        var isEmpty = function (str) {
            return (!str || 0 === str.length);
        };

        var objSize = function(obj) {
            var count = 0;
            
            if (typeof obj == "object") {
            
                if (Object.keys) {
                    count = Object.keys(obj).length;
                } else if (window._) {
                    count = _.keys(obj).length;
                } else if (window.$) {
                    count = $.map(obj, function() { return 1; }).length;
                } else {
                    for (var key in obj) if (obj.hasOwnProperty(key)) count++;
                }
                
            }
            return count;
        };

        var isHTML = function (str) {
            return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(str);
        };
        var method = {};

        method.instances = {};

        var basicState = function(id,obj,settings,instance){
            if(!$.isPlainObject(obj)){
                obj = {};
            }
            return $.extend({
                name: 'state_' + instance.states.length,
                title: null,
                content: '',
                buttons: settings.buttons,
                submit: function(m,v){
                    if(v){
                        this.close();
                    }
                },
                position: []
            }, obj);
        };
		
        var buildModal = function(id,settings,instance){

            var dialog =  $("<div></div>");
            //Dialog
            dialog.addClass('modalContainer')
            .css($.extend(settings.modalCss,{
                position: settings.fixed ? 'fixed' : 'absolute',
                zIndex: settings.zIndex + 2
            }));
			instance.state_list = $('<ul class="xdialog_states"></ul>');
			
            //overlay
            if(settings.modal){
                var modalBorderColor = dialog.css('border-color');
                instance.overlay = $('<div></div>')
                .addClass('modalOverlay')
                .addClass('modalOverlay_'+id)
                .css($.extend(settings.overlayCss,{
                    opacity: settings.opacity / 100,
					position: 'fixed',
					left: 0,
					top: 0,
					zIndex: settings.zIndex + 1
                }));
            }

            //close
            if(settings.showClose){
                instance.close_element = $('<a></a>')
				.addClass('modalClose')
				.addClass('modalClose_'+id)
				.attr({href:'#'})
				.html(settings.closeText);
                instance.close_element.appendTo(dialog);
            }

            if(settings.showClose){
                $('body').on('click','.modalClose_'+id,function(e){
                    e.preventDefault();
                    instance.close();
                });
            }
            if(settings.modal){
                $('body').on('click','.modalOverlay_'+id,function(e){
                    if(settings.overlayClose){
                        e.preventDefault();
                        instance.close();
                    } else {
                        dialog.addClass('flash');
                        window.setTimeout(function(){
                            dialog.removeClass('flash');
                        }, 500);
                    }
                });
            }
            instance.dialog = dialog;
		};

        var buildState = function (id,state,instance,settings){

            var thisState = $('<li></li>')
            .addClass('state_item')
            .addClass('state_' + state.name);
            
			var state_header,state_content,state_footer,submit;
            
            function createHeader(title){
                state_header = $('<div><strong></strong></div>')
                .addClass('modalHeader')
                state_header.find('strong').text(title);
                state_header.prependTo(thisState);
            }
            function createContent(content) {
                state_content = $('<div></div>')
                .addClass('modalContent')
                state_content.html(content);
                state_content.appendTo(thisState);
            }
            function createFooter(state_btns){
                var btns = [],
                    btnsWrp = $('<div></div>').addClass('buttons').addClass('buttons_'+state.name);
                for(var key in state_btns) {
                    var $button = $('<button></button>').text(key);
                    if($.isPlainObject(state_btns[key])){
                        $button.attr(state_btns[key]);
                    }
                    else {
                        $button.attr('value',state_btns[key]);
                    }
                    if ($button.attr('type') == undefined) {
                        $button.attr('type','button');
                    }
                    $button.appendTo(btnsWrp);
                    btns.push(btnsWrp);
                }
                state_footer = $('<div></div>')
                .addClass('modalFooter')
                state_footer.append(btns); 
                state_footer.appendTo(thisState);
                
                $('body').on('click','.buttons_'+state.name+' button',function(e){
                    if(isset(state.submit)){
                        var v = $(this).attr('value');
                        state.submit.call(instance,thisState,v,e);
                    }
                });
            }
            //header
            if(isset(state.title)){
                createHeader(state.title);
            }
            //content
            if(isset(state.content)){
                createContent(state.content);
            }
            //foooter
            if(isset(state.buttons)){
                createFooter(state.buttons);
            }

			instance.state_list.append(thisState);
            instance.states.push(state);

            //unbindEvents();
            //bindEvents();
        };

        method.build = function(data,options){
            if(options == undefined){
                options = {};
            }
            var instance = {};
            var settings = $.extend($.xDialog.defaults, options);
            var id = settings.id;
            if(!isEmpty(method.instances[settings.id])){
                id = settings.id + '' + objSize(method.instances);
            }
            settings.id = id;
            instance = {
                id:id,
                settings:settings,
                dialog_show:false,
                states_index:{},
                states:[],
                current_index: 0
            };
            method.instances[settings.id] = settings.id;
			
            instance.states = [];
            instance.states_index = [];
            buildModal(id,settings,instance);
            
            if (typeof data === 'object') {
                if($.isPlainObject(data)){
                    
                    buildState(id,state,instance,settings);
                } else if(data instanceof Array){
                    $.each(data, function (i, state) {
                        buildState(id,state,instance,settings);
                    });
                } else if(data instanceof jQuery){
                    data.each(function() {
                        var $this = $(this);
                        var obj = {};
                        if(isset($this.attr('id'))){
                            obj.name = $this.attr('id');
                        }
                        if(isset(settings.persist)){
                            $this = $this.clone();
                        }

                        obj.content = $this;

                        if(isset($this.attr('title'))){
                            obj.title = $this.attr('title');
                        }
                        var state = basicState(id,obj,settings,instance);
                        buildState(id,state,instance,settings);
                    });
                }
            } else if (typeof data === 'string' || typeof data === 'number') {
                if(isHTML(data)){
                    var $this = $(data);
                    var obj = {};
                    if(isset($this.attr('id'))){
                        obj.name = $this.attr('id');
                    }
                    if(isset(instance.settings.persist)){
                        $this = $this.clone();
                    }
                    obj.content = $this;
                    if(isset($this.attr('title'))){
                        obj.title = $this.attr('title');
                    }
                    var state = basicState(id,obj,settings,instance);
                    buildState(id,state,instance,settings);
                } else {
                    var obj = {};
                    obj.content = $this;
                    var state = basicState(id,obj,settings,instance);
                    buildState(id,state,instance,settings);
                }
            } else {
				// unsupported data type!
				alert('SimpleModal Error: Unsupported data type: ' + typeof data);
				return;
			}
            
            $.each(instance.states,function(i,state){
                instance.states_index[state.name] = i;
            });

            instance.show = function (state_name) {
                var index = 0;
                if(state_name !== undefined){
                    if(isset(this.states_index[state_name])){
                        index = this.states_index[state_name];
                    }
                }
                
                if(!this.dialog_show){
                    this.dialog_show = true;
                    this.dialog.append(this.state_list);
                    if(this.settings.modal){
                        this.overlay.appendTo(this.settings.appendTo);
                    }
                    
                    if(this.settings.onShow){
                        this.settings.onShow.call(this,this.dialog);
                    }
                    
                    this.dialog.appendTo(this.settings.appendTo);
                }

                var state = this.states[index];
                this.current_index = index;
                this.dialog.find('li.state_item').hide();
                this.dialog.find('li.state_'+state.name).show();
                this.position(state.position);

            };

            instance.position = function (pos) {
                
                var dialog = this.dialog,top, left;
                if(!isEmpty(pos) && $.isArray(pos)){
                    top = pos[0];
                    left = pos[1];
                } else {
                    top = (Math.max($(window).height() - dialog.outerHeight(), 0) / 2) + $(window).scrollTop();
                    left = (Math.max($(window).width() - dialog.outerWidth(), 0) / 2) + $(window).scrollLeft();
                }
                
                dialog.animate({
                    top: top,
                    left: left
                }, 400, function () {
                    if (isset(pos) && $.isArray(pos)) {
                        setTimeout(function () {
                            $('html, body').animate({
                                scrollTop: dialog.offset().top - 20
                            }, 400);
                        }, 100);
                    }
                });
                
                
                var id = this.id;
            };

            instance.next = function () {
                var index = this.current_index+1;
                var state = this.states[index];
                this.show(state.name);
            };

            instance.previous = function () {
                var index = this.current_index-1;
                if(index < 0){
                    index = 0;
                }
                var state = this.states[index];
                this.show(state.name);
            };

            instance.close = function () {
                this.dialog_show = false;
                
                if(this.settings.modal){
                    this.overlay.remove();
                }
                if(isset(this.settings.onClose)){
                    this.settings.onClose.call(this,this.dialog);
                }
                this.dialog.remove();
                delete method.instances[this.id];

            };

            var extended = $.extend({},instance);

            if(settings.autoOpen){
                extended.show();
            }
            return extended;
        };
        return method;
    };

    $.fn.xDialog = function(options ){
        $.xDialog(this,options);
    };

    $.xDialog.defaults = {
        id: 'xdialog',
		appendTo: 'body',
		opacity: 50,
		overlayId: null,
		overlayCss: {},
		dataCss: {},
		zIndex: 1000,
        closeText: '&times;',
		closeId: 'xmodalClose',
        showClose: true,
		escClose: true,
		overlayClose: false,
		fixed: true,
		modal: true,
        buttons:{ok:true}, //use null to disable showing any button
        onShow:null,
        onClose:null,
        autoOpen: true
    };
}( jQuery ));
