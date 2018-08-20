(function ($) {
    "use strict";
    /*
     * @example $('<div>my data</div>').xDialog({options});
     * @example $('#myDiv').xDialog({options});
     *
     * @example $.xDialog('<div>my data</div>', {options});
     * @example $.xDialog('my data', {options});
     * @example $.xDialog($('#myDiv'), {options});
     * @example $.xDialog({options});
     * @example $.xDialog(document.getElementById('myDiv'), {options});
     */

    $.xDialog = function (data, options) {
        var fadeInOut = false,
            showing = [],
            instances = [],
            d = {},
            methods = {},
            isset = function (arr) {
                if (typeof arr !== 'undefined' && arr !== null) {
                    return true;
                }
                return false;
            };

        methods.init = function (data, options) {
            var thisId;

            if (options == undefined) {
                options = {};
            }

            if (isset(options.identifier)) {
                thisId = options.identifier;
            } else {
                thisId = $.xDialog.defaults.identifier;
            }

            var prepare = function (name, content) {
                var state;
                if (!isset(options.states)) {
                    options.states = {};
                }
                options.states[name] = {};
                state = options.states[name];
                if (isset(content)) {
                    state.content = content;
                }

                if (isset(options.title)) {
                    state.title = options.title;
                }

                if (isset(options.buttons)) {
                    state.buttons = options.buttons;
                }

                if (isset(options.submit)) {
                    state.submit = options.submit
                }
            };

            if (typeof data == 'object') {
                if ($.isPlainObject(data) && !$.isEmptyObject(options)) {
                    options.states = data;
                } else if ($.isPlainObject(data) && $.isEmptyObject(options)) {
                    options = data;
                } else if (data instanceof jQuery) {
                    var noNameCount = 0,iteration = 0,itemCount = data.length;
                    options.states = {};
                    data.each(function () {

                        var $this = $(this),
                            name,
                            thisState,
                            buttons;

                        //make sure we have a name for the state
                        if (isset($this.attr('id'))) {
                            name = $this.attr('id');
                        } else {
                            noNameCount++;
                            name = $.xDialog.defaults.defaultState + String(noNameCount);
                        }

                        thisState = {}; //new state
                        //check if there is a title attribute and if there is one use this as the title of the state
                        if (isset($this.attr('title'))) {
                            thisState.title = $this.attr('title')
                        }

                        //callback when submitting
                        if (isset(options.submit)) {
                            thisState.submit = options.submit
                        }
                        thisState.content = $this; //state content

                        iteration++;
                        if (isset(options.backButton)) {

                            //backButton
                            if (iteration > 1) {
                                if (!isset(buttons)) {
                                    buttons = {}
                                }
                                buttons = $.extend(buttons, options.backButton);
                            }
                        }

                        //prepare the buttons
                        if (isset(options.buttons)) {
                            if (!isset(buttons)) {
                                buttons = {};
                            }
                            buttons = $.extend(buttons, options.buttons);
                        }

                        if (isset(options.nextButton)) {
                            //next button
                            if (itemCount > 1 && iteration < itemCount) {
                                if (!isset(buttons)) {
                                    buttons = {}
                                }
                                buttons = $.extend(buttons, options.nextButton);
                            }
                        }

                        if (isset(buttons)) {
                            thisState.buttons = buttons;
                        }
                        options.states[name] = thisState;
                    });

                } else { //must be a dom object
                    // convert DOM object to a jQuery object
                    data = $(data);
                    prepare(name, data)
                }

            } else if (typeof data === 'string' || typeof data === 'number') {
                var name;
                data = $('<div></div>').addClass('dataContent').html(data);
                if (isset(options.name)) {
                    name = options.name;
                } else {
                    name = $.xDialog.defaults.defaultState;
                }
                prepare(name, data);
            } else {
                alert('xDialog Error: Unsupported data type: ' + typeof data);
            }

            d.settings = $.extend({}, $.xDialog.defaults, options);
            methods.prepare(d.settings);
        };
        /*
         * prepare the modal dialog
         */

        methods.prepare = function (data) {
            console.log(data);
            var overlay, wrapper, modalContainer, modalClose, k, states, count = 0,size;

            overlay = $('<div class="modalOverlay"></div>').css({
                'position': 'fixed',
                'z-index': data.zIndex + 1,
                left: 0,
                top: 0
            });

            wrapper = $('<div class="modalWrapper"><button class="modalClose"></button><div class="modalContainer"></div></div>').css({
                position: data.fixed ? 'fixed' : 'absolute',
                zIndex: data.zIndex + 2,
                top: 0,
                left: 0
            });

            wrapper.attr('id', d.settings.identifier);
            modalContainer = wrapper.find('.modalContainer');
            modalClose = wrapper.find('.modalClose').html('&times;');
            states = data.states;

            function getSize(obj) {
                var size = 0,
                    key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            }

            size = getSize(states);
            
            
            d.stateList = [];
            d.states = [];

            for (var sta in states) {
                d.stateList.push(sta);
            }

            for (k in states) {
                var state,
                    stateObj,
                    btnWrapper;
                count++;
                state = states[k];
                stateObj = $('<div class="stateWrap"></div>').attr('id', k + data.identifier);

                //header
                if (isset(state.title)) {
                    var header = $('<div></div>')
                        .addClass('modalHeader')
                        .html(state.title);
                    header.appendTo(stateObj);
                }

                //contents
                if (isset(state.content)) {
                    var content = $('<div></div>')
                        .addClass('modalContent')
                        .html(state.content);
                    content.appendTo(stateObj);
                }

                //buttons
                if (isset(state.buttons)) {
                    btnWrapper = $('<div></div>').addClass('buttons');

                    for (var key in state.buttons) {

                        var $button = $('<button></button>').html(key);

                        if ($.isPlainObject(state.buttons[key])) {
                            $button.attr(state.buttons[key]);
                        } else {
                            $button.attr('value', state.buttons[key]);
                        }

                        if ($button.attr('type') == undefined) {
                            // attribute 'type' does not exists
                            $button.attr('type', 'button');
                        }
                        $button.appendTo(btnWrapper);
                    }
                }

                //buttons and footer
                if (isset(btnWrapper)) {
                    var modalFooter = $('<div class="modalFooter"></div>');
                    modalFooter.html(btnWrapper);
                    modalFooter.appendTo(stateObj);
                }

                if (isset(data.defaultState)) {
                    if (k == data.defaultState) {
                        d.defaultState = k;
                    }
                }
                d.states[k] = stateObj;
                stateObj.css('display', 'none').appendTo(modalContainer);
            }

            d.id = d.settings.identifier;
            //if d.defaultState is still not defined
            if (!isset(d.defaultState)) {
                d.defaultState = d.stateList[0];
            }

            d.currentState = d.defaultState;
            d.overlay = overlay.css('opacity', 0).hide();
            d.dialog = wrapper.hide();
            //d.states = data.states;
            d.showNextState = function () {
                var thisStateList = this.stateList,
                    currState = this.currentState,
                    next;
                for (var x in thisStateList) {
                    var dx = x;
                    if (thisStateList[x] == currState) {
                        dx++;
                        if (isset(thisStateList[dx])) {
                            next = thisStateList[dx];
                            methods.showState(this.id, next);
                        }
                    }
                }
                return next;
            }
            d.showPreviousState = function () {
                var thisStateList = this.stateList,
                    currState = this.currentState,
                    prev;
                for (var x in thisStateList) {
                    var dx = x;
                    if (thisStateList[x] == currState) {
                        dx--;
                        if (isset(thisStateList[dx])) {
                            prev = thisStateList[dx];
                            methods.showState(this.id, prev);
                        }
                    }
                }
                return prev;
            }
            d.close = function () {
                methods.close(this.id);
            }

            instances[d.settings.identifier] = d;
            if (d.settings.autoOpen) {
                methods.show(d.id);
            }
            d = {};
        };

        /*
         * Show the modal Dialog
         */
        methods.show = function (id) {
            var obj, overlay, dialog, settings, defaultState, modalContainer;
            obj = instances[id];
            dialog = obj.dialog;
            settings = obj.settings;
            defaultState = obj.states[obj.defaultState];
            obj.currentState = obj.defaultState;
            modalContainer = dialog.find('.modalContainer');

            //show the overlay if available
            if (isset(obj.overlay)) {
                overlay = obj.overlay;
                overlay.appendTo(settings.appendTo);
            }
            //show the default State
            if (defaultState && !defaultState.is(':visible')) {
                modalContainer.children().hide();
                defaultState.show();
            }
            dialog.appendTo(settings.appendTo);
            if (isset(obj.overlay)) {
                overlay = obj.overlay;
                overlay.show(50, function () {
                    overlay.animate({
                        opacity: settings.opacity / 100
                    }, 200, function () {
                        dialog.slideDown(200);
                    });
                });
            } else {
                dialog.slideDown(200);
            }
            if (isset(settings.onShow)) {
                settings.onShow.call(obj, dialog);
            }
            methods.bindEvents(id);
            methods.position(id);
            showing[id] = true;
            //console.log(obj);
        };

        /*
         * Bind events to the modal
         */
        methods.bindEvents = function (id) {
            var obj, overlay, dialog, settings;
            obj = instances[id];
            dialog = obj.dialog;
            settings = obj.settings;

            $(window).on('resize.' + settings.identifier, function () {
                methods.position(id);
            });

            if (settings.modal && isset(obj.overlay)) {
                overlay = obj.overlay;
                overlay.on('click.' + settings.identifier, function (e) {
                    if (settings.overlayClose) {
                        e.preventDefault();
                        methods.close(settings.name);
                    } else {
                        if (fadeInOut) {
                            {
                                return false;
                            }
                        };
                        if (!fadeInOut) {
                            fadeInOut = true;
                            var $mytd = dialog,
                                $elie = $mytd.clone(),
                                os = $mytd.offset();

                            // Create clone w other bg and position it on original
                            $elie.appendTo('body').addClass("flash").offset({
                                top: os.top,
                                left: os.left
                            });
                            // Show clone at same time
                            $elie.fadeOut(400, function () {
                                $elie.removeClass("flash").hide().remove();
                                fadeInOut = false;
                            });
                        }
                    }
                });
            }

            dialog.find('button.modalClose').on('click.' + settings.identifier, function () {
                methods.close(id);
            });

            dialog.find('.stateWrap').each(function (index, Element) {
                var submit, state, stateid, stateName, $this = $(this),
                    $stateFooter;
                stateid = $this.attr('id');
                stateName = stateid.replace(settings.identifier, '');
                state = obj.settings.states[stateName];
                if (isset(state.submit)) {
                    $stateFooter = $this.find('.modalFooter');
                    var $button = $stateFooter.find('.buttons button');

                    $button.on('click.' + settings.identifier, function (event) {
                        var $btn = $(this);
                        submit = state.submit;
                        submit.call(obj, this, $(this).val(), $(this).text(), event);
                    });
                }
            });

            $(window).on('keydown.' + settings.identifier, function (e) {
                var $targets = $('.modalWrapper').find('input,select,textarea,button,a');
                if (isset(obj.overlay) && e.keyCode === 9) { // TAB
                    if ($('.modalWrapper').has(e.target).length == 0) {
                        $targets.eq(0).focus();
                        e.preventDefault();
                    } else {
                        $('.modalWrapper').eq(0).focus();
                    }
                } else if (settings.escClose && e.keyCode === 27) { // ESC
                    e.preventDefault();
                    methods.close(id);
                }
            });
        };

        /*
         * Position the modal Dialog
         */
        methods.position = function (id) {
            var obj, dialog, settings, top, left, pos, state;

            if (obj = methods.isAvailable(id)) {
                dialog = obj.dialog;
                settings = obj.settings;
                state = settings.states[obj.currentState];
                pos = state.position;

                // if position is not defined, we will just center the modal dialog on the screen
                if (isset(pos) && $.isArray(pos)) {
                    top = pos[0];
                } else {
                    top = (Math.max($(window).height() - dialog.outerHeight(), 0) / 2) + $(window).scrollTop();
                }

                if (isset(pos) && $.isArray(pos)) {
                    left = pos[1];
                } else {
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
            }
        };

        /*
         * Close the modal Dialog
         */
        methods.close = function (id) {
            var obj, dialog, settings, top, left, pos;
            if (id == 'undefined') {
                id = $.xDialog.defaults.identifier;
            }
            if (obj = methods.isAvailable(id)) {
                dialog = obj.dialog;
                settings = obj.settings;

                obj.dialog.slideUp(200, function () {
                    obj.dialog.remove();

                    if (isset(settings.onClose)) {
                        settings.onClose.call(obj.dialog);
                    }
                    methods.unbindEvents(id);
                })

                if (settings.modal) {
                    obj.overlay.animate({
                        opacity: 0
                    }, 300, function () {
                        obj.overlay.remove();
                    });
                }

                if (isset(settings.onClose)) {
                    settings.onClose.call(obj, dialog);
                }

                methods.unbindEvents(id);
                showing[id] = false;
            }
            return false;
        };

        /*
         * Unbind events
         */
        methods.unbindEvents = function (id) {
            var obj, dialog, settings;
            if (obj = methods.isAvailable(id)) {
                dialog = obj.dialog;
                settings = obj.settings;
                $(window).off('.' + settings.identifier);
            }
        };

        /*
         * Check if the modal is showing
         */
        methods.isShowing = function (name) {
            return isset(showing[name]);
        }

        /*
         * Show a particular state
         */
        methods.showState = function (modalId, stateName) {
            var obj, dialog, settings, state, states;
            if (obj = methods.isAvailable(modalId)) {
                dialog = obj.dialog;
                settings = obj.settings;
                if (isset(state = obj.states[stateName])) {
                    //make sure that the current state logged
                    obj.currentState = stateName;
                    states = dialog.find('.modalContainer').children();
                    if (state.length > 0 && !state.is(':visible')) {
                        states.slideUp(200);
                        state.slideDown(200);
                    }
                    methods.position(modalId);
                }
            }
            return false;
        };

        //check if a instance of modal dialog is available
        methods.isAvailable = function (id) {
            if (isset(instances[id])) {
                return instances[id];
            } else {
                return false;
            }
        };
        methods.init(data, options);
        return methods;
    };

    $.fn.xDialog = function (options) {
        $.xDialog(this, options);
    };
    
    $.xDialog.defaults = {
        identifier: 'xDialog',
        appendTo: 'body',
        opacity: 50,
        zIndex: 1000,
        defaultState: 'state',
        escClose: true,
        overlayClose: false,
        modal: true,
        fixed: true,
        onShow: null,
        onClose: null,
        autoOpen: true,
        autoButton: true
    };
}(jQuery));