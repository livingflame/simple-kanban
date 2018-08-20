(function ($) {
	"use strict";
    $.kanban = function (options) {
        if (!window.JSON) {
            window.JSON = {
                parse: function (sJSON) {
                    return eval('(' + sJSON + ')');
                },
                stringify: (function () {
                    var toString = Object.prototype.toString;
                    var isArray = Array.isArray || function (a) {
                        return toString.call(a) === '[object Array]';
                    };
                    var escMap = {
                        '"': '\\"',
                        '\\': '\\\\',
                        '\b': '\\b',
                        '\f': '\\f',
                        '\n': '\\n',
                        '\r': '\\r',
                        '\t': '\\t'
                    };
                    var escFunc = function (m) {
                        return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
                    };
                    var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
                    return function stringify(value) {
                        if (value == null) {
                            return 'null';
                        } else if (typeof value === 'number') {
                            return isFinite(value) ? value.toString() : 'null';
                        } else if (typeof value === 'boolean') {
                            return value.toString();
                        } else if (typeof value === 'object') {
                            if (typeof value.toJSON === 'function') {
                                return stringify(value.toJSON());
                            } else if (isArray(value)) {
                                var res = '[';
                                for (var i = 0; i < value.length; i++)
                                    res += (i ? ', ' : '') + stringify(value[i]);
                                return res + ']';
                            } else if (toString.call(value) === '[object Object]') {
                                var tmp = [];
                                for (var k in value) {
                                    if (value.hasOwnProperty(k))
                                        tmp.push(stringify(k) + ': ' + stringify(value[k]));
                                }
                                return '{' + tmp.join(', ') + '}';
                            }
                        }
                        return '"' + value.toString().replace(escRE, escFunc) + '"';
                    };
                })()
            };
        }

        if (!Object.keys) {
            Object.keys = function (obj) {
                var keys = [],
                    k;
                for (k in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, k)) {
                        keys.push(k);
                    }
                }
                return keys;
            };
        }
  // Original JavaScript code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function checkTime(field)
  {
    var errorMsg = "";

    // regular expression to match required time format
    var re = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;
    var value = field.val();
    if(value != '') {
      if(regs = value.match(re)) {
        if(regs[4]) {
          // 12-hour time format with am/pm
          if(regs[1] < 1 || regs[1] > 12) {
            errorMsg = "Invalid value for hours: " + regs[1];
          }
        } else {
          // 24-hour time format
          if(regs[1] > 23) {
            errorMsg = "Invalid value for hours: " + regs[1];
          }
        }
        if(!errorMsg && regs[2] > 59) {
          errorMsg = "Invalid value for minutes: " + regs[2];
        }
      } else {
        errorMsg = "Invalid time format: " + field.value;
      }
    }

    if(errorMsg != "") {
      field.focus();
      return false;
    }

    return true;
  }
  // Original JavaScript code by Chirp Internet: www.chirp.com.au
  // Please acknowledge use of this code by including this header.

  function checkDate(field)
  {
    var allowBlank = true;
    var minYear = 1902;
    var maxYear = (new Date()).getFullYear();

    var errorMsg = "";

    // regular expression to match required date format
    var re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    var value = field.val();
    if(field.value != '') {
      if(regs = field.value.match(re)) {
        if(regs[1] < 1 || regs[1] > 31) {
          errorMsg = "Invalid value for day: " + regs[1];
        } else if(regs[2] < 1 || regs[2] > 12) {
          errorMsg = "Invalid value for month: " + regs[2];
        } else if(regs[3] < minYear || regs[3] > maxYear) {
          errorMsg = "Invalid value for year: " + regs[3] + " - must be between " + minYear + " and " + maxYear;
        }
      } else {
        errorMsg = "Invalid date format: " + field.value;
      }
    } else if(!allowBlank) {
      errorMsg = "Empty date not allowed!";
    }

    if(errorMsg != "") {
      alert(errorMsg);
      field.focus();
      return false;
    }

    return true;
  }

        /*  modifified from https://stackoverflow.com/questions/9335140/how-to-countdown-to-a-date  */
        function CountDownTimer(dt, element)
        {
            var end = new Date(dt);

            var _second = 1000;
            var _minute = _second * 60;
            var _hour = _minute * 60;
            var _day = _hour * 24;
            var timer;

            if ( element.length ) {
                function showRemaining() {
                    var now = new Date();
                    var distance = end - now;

                    if (distance > 0) {
                        var days = Math.floor(distance / _day);
                        var hours = Math.floor((distance % _day) / _hour);
                        var minutes = Math.floor((distance % _hour) / _minute);
                        var seconds = Math.floor((distance % _minute) / _second);
                        var content = '';
                        if(days){
                            content += days + 'd ';
                        }
                        if(hours){
                            content += hours + 'h ';
                        }
                        if(minutes){
                            content += minutes + 'm ';
                        }
                        if(seconds){
                            content += seconds + 's';
                        }
                        element.html(content);
                    } else {
                        clearInterval(timer);
                        var options = { year: 'numeric', month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit' };
                        element.html(end.toLocaleDateString("en-US",options));
                        if(!element.is('.past_due')){
                            element.addClass('past_due');
                        }
                    }                    
                }
                
                timer = setInterval(showRemaining, 1000);
            } else {
                timer = null;
            }
        }

        function isset(variable) {
            return typeof variable !== typeof undefined ? true : false;
        }

        function isEmpty(str) {
            return (!str || 0 === str.length);
        }

        function reverseObject(Obj){
            var temp_arr = [];
            var new_obj = {};
            for (var Key in Obj){
                temp_arr.push(Key);
            }
            for (var i = temp_arr.length-1; i >= 0; i--){
                new_obj[temp_arr[i]] = Obj[temp_arr[i]];
            }
            return new_obj;
        }
		var settings = $.extend({
			user: 	    'usr_1502874459563',
			api_url:    'server.php',
			colors: 	[
                'default',
                'primary',
                'success',
                'info',
                'warning',
                'danger'
            ],
            converter: {
                makeHtml: function(str){
                    return str;
                }
            },
            hidden_div: $(document.createElement('div'))
		}, options);

        var methods = {};

        var app_data = {
            people: {},
            state_index: [],
            states: []
        };
        var current_user = settings.user;
        var possible_colors = settings.colors;
        var converter = settings.converter;
        var hidden_div = settings.hidden_div;

        methods.setCookie = function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        };

        methods.getCookie = function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };

        methods.getApiUrl = function(){
            return settings.api_url;
        };

        methods.closeNotification = function(){
            $('.info_message').animate({
                height: "toggle"
            },400,function(){
                $('.info_message').remove();
            });
        };

        methods.notify = function(params){
            // Extending array from params
            var options = $.extend({ 
                'showAfter': 0, // number of sec to wait after page loads
                'duration': 0, // display duration
                'autoClose' : false, // flag to autoClose notification message
                'type' : 'success', // type of info message error/success/info/warning
                'message': '', // message to dispaly
                'description' : '', // link to desciption to display on clicking link message
                'appendTo' : '#notify_container' 
            }, params);
            
            var msgclass = 'succ_bg'; // default success message will shown
            if(options['type'] == 'error'){
                msgclass = 'error_bg'; // over write the message to error message
            } else if(options['type'] == 'information'){
                msgclass = 'info_bg'; // over write the message to information message
            } else if(options['type'] == 'warning'){
                msgclass = 'warn_bg'; // over write the message to warning message
            } 
            
            // Parent Div container
            var container = '<div class="info_message '+msgclass+'">';
            container += '  <div class="center_auto">';
            container += '      <div class="info_message_text">' + options['message'] + '</div>';
            container += '      <div class="button_area">';
            if(options['description']){
                container += '<a class="link_notification" href="#"><i class="glyphicon glyphicon-info-sign"></i></a> ';
            }
            container += '<a href="#" class="info_close_btn"></a>';
            container += '</div>';
            container += '<div class="clearboth"></div>';
            container += '  </div>';
            container += '  <div class="info_more_descrption"></div>';
            container += '<div class="clearboth"></div>';
            container += '</div>';
            var $container = $(container);
            $container.hide();
            // Appeding notification to Body
            $(options.appendTo).append($container);
            var closeNotification = function(){
                $container.animate({
                    height: "toggle"
                },600,function(){
                    $container.remove();
                });
            };

            // sliding down the notification
            var showNotification = function(showAfter, autoClose){    
                setTimeout(function(){
                    // showing notification message, default it will be hidden
                    $container.slideDown(400,function(){
                        if(autoClose){
                            setTimeout(function(){
                                closeNotification();
                            }, options['duration'] * 1000);
                        }
                    });
                }, parseInt(showAfter * 1000));    
            };

            if(options['description']){
                $container.find('.info_more_descrption').text(options['description']);
            }
            
            // Slide Down notification message after startAfter seconds
            showNotification(options['showAfter'], options['autoClose']);

            $container.on('click','.link_notification',function(e){
                e.preventDefault();
                if(options['description']){
                    $container.find('.info_more_descrption').toggle();
                }
            });

            $container.on('click','.info_close_btn',function(e){
                e.preventDefault();
                closeNotification();
            });
        };

        methods.notifyEvent = function(event,description){
            methods.notify({
                type : "information",
                message: event,
                autoClose: true,
                description: description,
                duration: 2
            });
        };

        methods.loadBoard = function () {
            methods.notifyEvent('Fetching data','Board');
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_all'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_people = data.raw_people;
                    app_data.raw_cards = data.raw_cards;
                    app_data.raw_states = data.raw_states;
                    methods.buildBoard();
                }
            });
        };

        methods.loadUsers = function () {
            methods.notifyEvent('Fetching data','Users');
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_users'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_people = data;
                    methods.notifyEvent('Fetched Data',' Users');
                }
            });
        };

        methods.saveUsers = function () {
            var data = JSON.stringify(app_data.raw_people);
            methods.notifyEvent('Saving data',' Users');
            if (data === '') {
                data = {};
            }
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=save_users',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    methods.notifyEvent('Saved data',' Users');
                }
            });
        };

        methods.loadStates = function () {
            methods.notifyEvent('Fetching data',' States');
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_columns'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_states = data;
                    methods.notifyEvent('Fetched Data',' States');
                }
            });
        };

        methods.loadCards = function () {
            methods.notifyEvent('Fetching data',' Cards');
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_cards'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_cards = data;
                    methods.notifyEvent('Fetched Data',' Cards');
                }
            });
            //return raw_cards;
        };

        methods.saveCards = function () {
            var data = JSON.stringify(app_data.raw_cards);
            methods.notifyEvent('Saving data',' Cards');
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=save_cards',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    methods.notifyEvent('Saved data',' Cards');
                }
            });
        };

        methods.loadArchives = function () {
            methods.notifyEvent('Fetching data',' Archived Cards');
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_archives'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_cards = data;
                    notifyEvent('Fetched Data',' Cards');
                    methods.buildBoard();

                }
            });
            //return raw_cards;
        };

        methods.archiveCards = function (cards) {
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=save_archives',
                data: {
                    cards: cards
                },
                dataType: 'json',
                success: function (data) {
                    methods.notifyEvent('Cards have been archived');
                }
            });
        };

        methods.initStates = function (states_input) {
            var states_array = [];
            var states = [];
            var states_index = [];

            $.each(states_input, function (i, state) {
                states_array.push(state);
            });

            states_array.sort(function (a, b) {
                return parseFloat(a.index) - parseFloat(b.index);
            });

            $.each(states_array, function (i, state) {
                states_index[state.id] = i;
                states.push({
                    id: state.id,
                    label: state.label,
                    wip: state.wip,
                    cards: []
                });
            });

            return {
                states: states,
                index: states_index
            };
        };

        methods.removeCard = function(story_id,callback){
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=remove_card',
                data: {
                    card_id: story_id
                },
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(result.code){
                        delete app_data.raw_cards[story_id];
                        $('.card_item_' + data.id).slideUp(400,function(){
                            $(this).remove();
                            callback && callback.call(data);
                            methods.buildBoard();
                        });
                        
                    } else {
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'error', // type of info message error/success/info/warning
                            'message': data // message to dispaly
                        });
                    }
                }
            });
        };

        methods.addCard = function(story,callback){
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=add_card',
                data: story,
                dataType: 'json',
                success: function (json) {
                    var data = json.data;
                    if(json.code){
                        app_data.raw_cards[data.id] = data;
                        methods.notify({
                            'duration': 3,
                            'autoClose' : true,
                            'type' : 'success',
                            'message': 'Card added: ' + data.title
                        });
                        callback && callback.call(data);
                        methods.buildBoard();
                    } else {
                        methods.notify({
                            'duration': 3,
                            'autoClose' : true,
                            'type' : 'error',
                            'message': data
                        });
                    }
                }
            });

        };

        
        methods.getCardById = function(card_id){
            return app_data.raw_cards[card_id];
        };

        methods.getStateById = function(state_id){
            var state = app_data.raw_states[state_id];
            var index = app_data.state_index[state.id];
            return app_data.states[index];
        };

        methods.removeColumn = function(state_id,callback){
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=remove_column',
                data: {
                    state_id: state_id
                },
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(result.code){
                        
                        var new_states = [];
                        delete app_data.raw_states[state_id];
                        $.each(app_data.raw_states, function (i, new_state) {
                            if (new_state) {
                                new_states.push(new_state);
                            }
                        });
                        new_states.sort(function (a, b) {
                            return parseFloat(a.index) - parseFloat(b.index);
                        });
                        $.each(new_states, function (i, new_state) {
                            app_data.raw_states[new_state.id] = new_state;
                        });
                        callback && callback.call(data);
                        methods.buildBoard();
                    } else {
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'error', // type of info message error/success/info/warning
                            'message': data // message to dispaly
                        });
                    }
                }
            });

        };
        
        methods.updateState = function(state_id,state){
            app_data.raw_states[state_id] = state;
        };
        
        methods.getAllStates = function(){
            return app_data.states;
        };

        methods.newColumnObject = function (object2) {
            var id = new Date().getTime();
            return $.extend({
                id: 'c_' + app_data.states.length + "_" + id,
                label: 'Column ' + app_data.states.length,
                index: app_data.states.length,
                wip: 0
            }, object2);
        }

        methods.newCardObject = function (object2) {
            if (object2.state === null) {
                var state = app_data.states[0];
                object2.state = state.id;
            }
            return $.extend({
                id: null,
                title: null,
                content: null,
                responsible: [],
                state: null,
                color: 0,
                index: 0,
                comments: [],
                attachments: [],
                tasks: []
            }, object2);
        };

        methods.clearState = function (state_id,callback) {
            var state_index = app_data.state_index[state_id];
            var cards = [];
            $.each(app_data.states[state_index].cards, function (i, card) {
                cards.push(card); 
            });

            if(!isEmpty(cards)){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=remove_cards',
                    data: {
                        cards: cards
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code == 1){
                            var count = data.length;
                            $.each(data, function (i, card) {
                                var card_id = card.id;
                                $('.card_item_' + card_id).slideUp(400,function(){
                                    $(this).remove();
                                    delete app_data.raw_cards[card_id];
                                });
                                count = count-1;
                                if(!count){
                                    app_data.states[state_index].cards = [];
                                    callback && callback.call(data);
                                }
                            });
                            
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'cards removed!' // message to dispaly
                            });
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                            
                        }
                        
                    }
                });
            }
        };

        methods.archiveStateCards = function (state_id) {
            var state_index = app_data.state_index[state_id];
            var archives = [];
            $.each(app_data.states[state_index].cards, function (i, card) {
                archives.push(card);
                delete app_data.raw_cards[card];
            });

            app_data.states[state_index].cards = [];
            methods.archiveCards(archives);
            methods.saveCards();
            methods.buildBoard();
        };
        methods.getAllUsers = function(){
            return app_data.raw_people;
        };
        methods.getUserById = function(user_id){
            if (app_data.raw_people[user_id] !== null || app_data.raw_people[user_id] !== undefined) {
                return app_data.raw_people[user_id];
            }
            return;
        };
        
        methods.getUserCards = function(user_id){
            if (app_data.raw_people[user_id] === null || app_data.raw_people[user_id] === undefined) {
                return [];
            }
            return app_data.people[user_id].cards;
        };
        
        methods.cardToUser = function(user_id, story){
            if (app_data.raw_people[user_id] === null || app_data.raw_people[user_id] === undefined) {
                return [];
            }
            if(app_data.people[user_id].cards !== Array){
                app_data.people[user_id].cards = [];
            }
            app_data.people[user_id].cards.push(story);
        };
        
        methods.makeUserResponsibleToCard = function (user_id, story) {
            if(!isEmpty(user_id)){
                if(user_id.constructor === Array){
                    $.each(user_id, function (i, res) {
                        methods.cardToUser(res,story);
                    });
                } else {
                    methods.cardToUser(user_id,story);
                }
            }
        };
        
        methods.enableDrag = function () {
            $('#board').dragsort({
                dragSelector: 'div.col_state .column_head',
                dragBetween: true,
                placeHolderTemplate: "<div class='col_state placeholder'>&nbsp</div>",
                dragEnd: methods.droppedColumn
            });
            $('#board ul.state').dragsort({
                dragSelector: 'li .box .card_top',
                dragBetween: true,
                placeHolderTemplate: "<li class='placeholder'><div>&nbsp</div></li>",
                dragEnd: methods.droppedCard
            });
        };
        
        methods.updateCards = function(cards,callback){
            if(!isEmpty(cards)){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=update_cards',
                    data: {
                        cards: cards
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            $.each(data, function (i, card) {
                                app_data.raw_cards[card.id] = card;
                            });
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'Cards updated' // message to dispaly
                            });
                            callback && callback.call(data);
                            methods.buildBoard();
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                            methods.buildBoard();
                        }
                    }
                });
            }
        };

        methods.updateCard = function(story_id,story){
            var cards = {};
            cards[story_id] = story;
            methods.updateCards(cards,function(){
                app_data.raw_cards[story_id] = story;
            });
        };
        
        /**
         * callback when an element has moved
         */
        methods.droppedCard = function () {
            var cards = {};
            var needs_update = false;
            var new_state_id = $(this).closest('ul.state').attr('id').replace('list_', '');
            var state = methods.getStateById(new_state_id); 
            var story_id = $(this).attr('data-id');
            var story = methods.getCardById(story_id);
            if (story.state != state.id) {
                needs_update = true;
            }

            if (story.index != $(this).closest('ul.state').find('li').index(this)) {
                needs_update = true;
            }

            if (needs_update) {
                if ((state.wip == 0) || state.cards.length + 1 <= state.wip) {
                    $(this).closest('ul.state').children().each(function () {
                        var id = $(this).attr('data-id');
                        cards[id] = {};
                        cards[id].index = $(this).closest('ul.state').find('li').index(this);
                        cards[id].state = state.id;
                    });
                }
                methods.updateCards(cards);
            }
        };

        methods.droppedColumn = function () {
            var cols = {};
            $(this).closest("#board").find('.col_state').each(function () {
                var id = $(this).attr('id').replace("state_", "");
                cols[id] = {};
                cols[id].index = $(this).parent().find('.col_state').index(this);
            });
            methods.updateColumns(cols);
        };
        methods.timeSince = function (time) {
          switch (typeof time) {
            case 'number':
              break;
            case 'string':
              time = +new Date(time);
              break;
            case 'object':
              if (time.constructor === Date) time = time.getTime();
              break;
            default:
              time = +new Date();
          }
          var time_formats = [
            [60, 'seconds', 1], // 60
            [120, '1 minute ago', '1 minute from now'], // 60*2
            [3600, 'minutes', 60], // 60*60, 60
            [7200, '1 hour ago', '1 hour from now'], // 60*60*2
            [86400, 'hours', 3600], // 60*60*24, 60*60
            [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
            [604800, 'days', 86400], // 60*60*24*7, 60*60*24
            [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
            [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
            [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
            [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
            [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
            [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
            [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
            [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
          ];
          var seconds = (+new Date() - time) / 1000,
            token = 'ago',
            list_choice = 1;

          if (seconds == 0) {
            return 'Just now'
          }
          if (seconds < 0) {
            seconds = Math.abs(seconds);
            token = 'from now';
            list_choice = 2;
          }
          var i = 0,
            format;
          while (format = time_formats[i++])
            if (seconds < format[0]) {
              if (typeof format[2] == 'string')
                return format[list_choice];
              else
                return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
            }
          return time;
        }
        methods.loadCard = function(card_id,callback){
            $.ajax({
                type: 'GET',
                url: methods.getApiUrl(),
                data: {
                    action: 'load_card',
                    card_id: card_id
                },
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(result.code){
                        callback && callback.call(data);
                    } else {
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'error', // type of info message error/success/info/warning
                            'message': data // message to dispaly
                        });
                        
                    }
                    
                }
            });
        }

        methods.buildComment = function(comment){
            var user_id = comment.user_id;
            var user =  app_data.raw_people[user_id];
            var date =  new Date(comment.time);
            var comment_html = '' +
                '<li id="comment_'+comment.id+'" class="comment_item">' +
                '<div class="comment_container">' +
                '<a href="#" class="user_pic">' +
                '<img src="userfiles/photos/' + user.photo + '" />' +
                '</a>' +
                '<a href="#" class="user_s_name">' + user.name + '</a>' +
                '<div class="comment_content">' +
                '<div class="comment_text">' +
                converter.makeHtml(comment.text) +
                '</div>' +
                '<div class="comment_options">' +
                '<span>'+methods.timeSince(date)+'</span> &bull; <a href="#" class="comment_edit" rel="'+comment.id+'">Edit</a> &bull; <a href="#" class="comment_delete" rel="'+comment.id+'">Delete</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>';
            return comment_html;
        };
        
        methods.updateComment = function(card_id, comment_id,  text, callback){
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=update_card_comment',
                data: {
                    card_id: card_id,
                    comment_id: comment_id,
                    text: text
                },
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(result.code){
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'success', // type of info message error/success/info/warning
                            'message': 'Comment/Activity updated' // message to dispaly
                        });
                        callback && callback.call(data);
                    } else {
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'error', // type of info message error/success/info/warning
                            'message': data // message to dispaly
                        });
                    }
                    
                }
            });
        };
        
        methods.removeComment = function(card_id, comment_id, callback){
            $.ajax({
                type: 'POST',
                url: methods.getApiUrl() + '?action=remove_card_comment',
                data: {
                    card_id: card_id,
                    comment_id: comment_id
                },
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(result.code){
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'success', // type of info message error/success/info/warning
                            'message': 'Comment/Activity removed' // message to dispaly
                        });
                        callback && callback.call(data);
                    } else {
                        methods.notify({ 
                            'duration': 3, // display duration
                            'autoClose' : true, // flag to autoClose notification message
                            'type' : 'error', // type of info message error/success/info/warning
                            'message': data // message to dispaly
                        });
                    }
                    
                }
            });
        };
        
        methods.addComment = function(card_id, comment, callback){
            if(comment){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=add_card_comment',
                    data: {
                        card_id: card_id,
                        text: comment
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'new comment added' // message to dispaly
                            });
                            callback && callback.call(data);
                            methods.buildBoard();
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                            
                        }
                        
                    }
                });
            }
        };
        methods.buildTask = function(task){
            var checked = "";
            var style = "";
            var done = ' data=""';
            if(task.done == 1){
               checked = ' checked="checked"';
               done = ' data="done"';
               style = ' style="text-decoration:line-through;"';
            }
            var task_html = "<li id=\"task_" + task.id + "\">" +
                "<div class='task_item'>" +
                    "<div class=\"task_label\"" + done + style + ">" + " " + task.task + "</div>" +
                    "<span class=\"task_option\">" +
                        "<input class='toggle_completion' type='checkbox'" + checked + "/> " +
                        "<i class=\"glyphicon glyphicon-pencil edit_task\" title=\"Edit Task\"></i> " + 
                        "<i class=\"glyphicon glyphicon-remove remove_task\" title=\"Remove Task\"></i>" +
                    "</span>" +  
                "</div>" +
            "</li>";
            return task_html;
        };

        methods.addTask = function(card_id,task,callback){
            if(task){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=add_task',
                    data: {
                        card_id: card_id,
                        task: task
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            var card = app_data.raw_cards[card_id];
                            var tasks = card.tasks;
                            tasks[data.id] = data;
                            card.tasks = tasks;
                            app_data.raw_cards[card_id] = card;
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'new task added' // message to dispaly
                            });
                            callback && callback.call(data);
                            methods.buildBoard();
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                            
                        }
                        
                    }
                });
            }
        };

        methods.removeTask = function(card_id,task_id,callback){
            if(task_id){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=remove_task',
                    data: {
                        card_id: card_id,
                        task_id: task_id
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            var card = app_data.raw_cards[card_id];
                            var tasks = card.tasks;
                            delete tasks[data.id];
                            card.tasks = tasks;
                            app_data.raw_cards[card_id] = card;
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'task removed' // message to dispaly
                            });
                            callback && callback.call(data);
                            methods.buildBoard();
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                        }
                        
                    }
                });
            }
        };

        methods.updateTask = function(card_id,task,callback){
            if(!isEmpty(task)){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=update_task',
                    data: {
                        card_id: card_id,
                        task: task,
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            var card = app_data.raw_cards[card_id];
                            var tasks = card.tasks;
                            tasks[data.id] = data;
                            card.tasks = tasks;
                            app_data.raw_cards[card_id] = card;
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'task updated' // message to dispaly
                            });
                            callback && callback.call(data);
                            methods.buildBoard();
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                        }
                    }
                });
            }
        };

        methods.updateColumns = function(cols){
            if(!isEmpty(cols)){
                $.ajax({
                    type: 'POST',
                    url: methods.getApiUrl() + '?action=update_columns',
                    data: {
                        columns: cols
                    },
                    dataType: 'json',
                    success: function (result) {
                        var data = result.data;
                        if(result.code){
                            $.each(data, function (i, column) {
                                app_data.raw_states[column.id] = column;
                            });
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'success', // type of info message error/success/info/warning
                                'message': 'Columns updated' // message to dispaly
                            });
                        } else {
                            methods.notify({ 
                                'duration': 3, // display duration
                                'autoClose' : true, // flag to autoClose notification message
                                'type' : 'error', // type of info message error/success/info/warning
                                'message': data // message to dispaly
                            });
                            
                        }
                        methods.buildBoard();
                    }
                });
            }
        };
        methods.createColumn = function (num, state) {
            var content = '<div id="state_' + state.id + '" class="col_state state_' + state.id + '">';
            content += '<h3 class="column_head">';
            content += ' <span class="state_wip">[' + state.cards.length;
            if (state.wip > 0) {
                content += '/' + state.wip;
            }
            content += ']</span> ';
            content += '<span class="state_label">' + state.label + '</span></h3>';
            content += '<div class="coloption">';
            content += '<a href="#" class="coloption_trigger btn btn-default btn-xs"><i class="glyphicon glyphicon-option-vertical"></i></a>';
            content += '<ul class="coldropdown">';
            content += '     <li><a href="#" class="edit_column"><i title="Edit Column" class="glyphicon glyphicon-edit"></i> Edit column</a></li>';
            content += '     <li><a href="#" class="add_card_to_column"><i class="glyphicon glyphicon-plus-sign"></i> Add a Card</a></li>';
            content += '     <li><a href="#" class="remove_column"><i class="glyphicon glyphicon-remove-sign"></i> Remove this column</a></li>';
            content += '     <li><a href="#" class="clear_column"><i class="glyphicon glyphicon-unchecked"></i> Remove all Cards</a></li>';
            content += '     <li><a href="#" class="archive_cards"><i class="glyphicon glyphicon-compressed"></i> Archive all Cards</a></li>';
            content += '</ul>';
            content += '</div>';
            content += '<ul class="state" id="list_' + state.id + '">';

            content += '</ul>';
            content += '<div class="new text-center"><i class="glyphicon glyphicon-plus-sign"></i> New Card</div>';
            content += '</div>';

            return content;
        };

        methods.createPeopleList = function () {
            console.log('Organizing users...');
            var peopleList = '<form ><ul class="people-list">';
            peopleList += '<li><span class="glyphicon glyphicon-user"></span></li>';
            $.each(app_data.people, function (key, value) {
                peopleList += '<li><span class="users-list" rel="' + key + '" title="@' + value.user_name + '">' + value.name + '</span></li>';
            });
            peopleList += '</ul></form>';
            $('#navigation').html(peopleList);
            console.log('Users organized...');
        };

        methods.createStoryItem = function (story) {
            
            var content = '<li data-id="' + story.id + '" class="card_item_' + story.id + '">';
            content += '<div id="card_' + story.id + '" class="box color_' + story.color + '">';
            content += "<div class=\"card_top\">";
            content += '<span class="card_actions">';
            content += '<i class="glyphicon glyphicon-remove delete" title="Remove Card"></i> ';
            content += '</span>';
            
            if (!isEmpty(story.responsible)) {
                content += "<div class=\"card_users\">";
                if(story.responsible.constructor === Array){
                    $.each(story.responsible, function (i, responsible) {
                        var user = methods.getUserById(responsible);
                        if($.isPlainObject(user)){
                            content += "<img src=\"userfiles/photos/" + user.photo + "\" alt=\"" + user.username + "\" title=\"" + user.name + "\">";
                        }
                        
                    });
                } else {
                    var user = methods.getUserById(responsible);
                    if($.isPlainObject(user)){
                        content += "<img src=\"userfiles/photos/" + user.photo + "\" alt=\"" + user.username + "\" title=\"" + story.name + "\">";
                    }
                }
                content += "</div>";                
            }
            
            
            content += "<span class=\"load\">&nbsp;</span>";
            content += "</div>";
            content += "<div class=\"card_title\">" + story.title;
            content += "<div class=\"card_footer\">";
            if (story.comments.length > 0) {
                content += '<span class="card_comment" title="Comments"><i class="glyphicon glyphicon-comment"></i> ' + story.comments.length + '</span> ';
            }
            if (story.attachments.length > 0) {
                content += '<span class="card_attachments" title="Attachments"><i class="glyphicon glyphicon-paperclip"></i> ' + story.attachments.length + '</span> ';
            }
            if (!isEmpty(story.tasks)) {
                var count = 0;
                $.each(story.tasks,function(i,task){
                    if(task.done == 1){
                        count++;
                    }
                });
                var tasks_len = Object.keys(story.tasks).length;
                content += '<span class="card_tasks" title="Tasks"><i class="glyphicon glyphicon-tasks"></i> '+count+'/'+tasks_len+'</span> ';
            }
            if (isset(story.due) && !isEmpty(story.due)) {
                content += '<code class="card_due" title="Due"><i class="glyphicon glyphicon-time"></i> <span id="due_' + story.id + '"></span></code> ';
            }

            content += "</div>";
            content += "</div>";
            content += '</li>';
            methods.makeUserResponsibleToCard(story.responsible, story.id);
            return content;
        };

        methods.buildData = function () {
            var needs_update = false;
            var people = {};
            $.each(app_data.raw_people, function (key, value) {
                people[key] = {};
                people[key].cards = [];
                people[key].id = value.id;
                people[key].index = value.index;
                people[key].name = value.name;
                people[key].user_name = value.user_name;
            });
            app_data.people = people;
            var states = methods.initStates(app_data.raw_states);
            app_data.states = states.states;
            app_data.state_index = states.index;

            $.each(app_data.raw_cards, function (story_id, card) {
                var state_key = app_data.state_index[card.state];
                if (typeof app_data.states[state_key] === 'undefined') {
                    if (0 in app_data.states) {
                        var state = app_data.states[0];
                        needs_update = true;
                        app_data.raw_cards[story_id].state = state.id;
                        state_key = app_data.state_index[state.id];
                        if (typeof app_data.states[state_key].cards === 'undefined') {
                            app_data.states[state_key].cards = [];
                        }
                        app_data.states[state_key].cards.push(story_id);
                    }
                } else {
                    if (typeof app_data.states[state_key].cards === 'undefined') {
                        app_data.states[state_key].cards = [];
                    }
                    app_data.states[state_key].cards.push(story_id);
                }
            });

            $.each(app_data.states, function (i, state) {
                var cards = state.cards;
                cards.sort(function (a, b) {
                    var card_a = app_data.raw_cards[a];
                    var card_b = app_data.raw_cards[b];
                    return parseInt(card_a.index) - parseInt(card_b.index);
                });
                app_data.states[i].cards = cards;
            });
            if (needs_update) {
                methods.saveCards();
            }
            console.log(app_data);
        };

        methods.buildBoard = function () {
            methods.buildData();
            var board = $('#board');
            $('#board').empty();
            $.each(app_data.states, function (i, state) {
                if (state !== null && typeof state === 'object') {
                    board.append(methods.createColumn(i, state));
                    var cards = state.cards;
                    $.each(cards, function (x, card) {
                        var story = app_data.raw_cards[card];
                        
                        
                        var content = methods.createStoryItem(story);
                        $('#list_' + state.id).append(content);
                        CountDownTimer(story.due,$('#due_' + card));
                    });
                }
            });
            methods.createPeopleList();
            methods.enableDrag();
        };

        methods.ready = function(){
            methods.loadBoard();
            $("#board").on('click', '.coloption', function (e) {
                e.preventDefault();
                $(this).find('.coldropdown').toggleClass('show_col_dropdown');
            });

            $("#board").on('mouseleave', '.coloption', function () {
                $(this).find('.coldropdown').removeClass('show_col_dropdown');
            });

            $("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");

            /*  new column  */
            $(document).on('click', '.new_column', function (e) {
                e.preventDefault();
                
                var modal_content = '<div class="row">';
                modal_content += '<div class="col-md-6">';
                modal_content += '    <label for="column_label">Name *</label>';
                modal_content += '    <input id="column_label" name="column_label" value="" type="text">';
                modal_content += '</div>';
                modal_content += '<div class="col-md-6">';
                modal_content += '    <label for="column_wip">WIP</label>';
                modal_content += '    <input id="column_wip" name="column_wip" value="0" type="text">';
                modal_content += '</div>';
                modal_content += '</div>';
                modal_content += '<div class="row"><div class="col-md-12"><p><i>WIP: Maximum "<strong>Work in Progress</strong>", 0 means unlimited</i></p></div></div>';

                modal({
                    type: 'primary',
                    title: 'New Column',
                    text: modal_content,
                    buttons: [{
                            text: 'Cancel',
                            val: false,
                            eKey: false,
                            addClass: 'btn-white',
                            onClick: function (dialog) {
                                $(dialog.html).find('a.modal-close-btn').click();
                            }
                        }, {
                            text: 'New Column',
                            val: true,
                            eKey: true,
                            addClass: 'btn-light-blue',
                            onClick: function (dialog) {
                                $.ajax({
                                    type: 'POST',
                                    url: methods.getApiUrl() + '?action=add_column',
                                    data: {
                                        "label": $(dialog.html).find('input[name="column_label"]').val(),
                                        "wip": $(dialog.html).find('input[name="column_wip"]').val()
                                    },
                                    dataType: 'json',
                                    success: function (json) {
                                        if(json.code){
                                            var data = json.data;
                                            var state = methods.newColumnObject(json.data);
                                            var $dialog = $(dialog.html);
                                            methods.updateState(state.id,state);
                                            methods.buildBoard();
                                            methods.notify({
                                                'duration': 3,
                                                'autoClose' : true,
                                                'type' : 'success',
                                                'message': 'Column added: ' + data.label
                                            });
                                            $dialog.find('a.modal-close-btn').click();
                                        } else {
                                            methods.notify({
                                                'duration': 3,
                                                'autoClose' : true,
                                                'type' : 'error',
                                                'message': json.data
                                            });
                                        }
                                    }
                                });
                            }
                        }, ],
                    template: '<div id="new_column" class="modal-box"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></div>',
                    _classes: {
                        box: '.modal-box',
                        boxInner: ".modal-inner",
                        title: '.modal-title',
                        content: '.modal-text',
                        buttons: '.modal-buttons',
                        closebtn: '.modal-close-btn'
                    }
                });
            });

            /*  edit state  */
            $("#board").on('click', '.edit_column', function (e) {
                e.preventDefault();
                var cols = {};
                var col_state = $(this).closest('.col_state');
                var state_id = col_state.attr('id').replace("state_", "");
                var state = methods.getStateById(state_id);
                var modal_content = '<div class="row">';
                modal_content += '<div class="col-md-6">';
                modal_content += '    <label for="column_label">Name *</label>';
                modal_content += '    <input id="column_label" name="column_label" value="' + state.label + '" type="text">';
                modal_content += '</div>';
                modal_content += '<div class="col-md-6">';
                modal_content += '    <label for="column_wip">WIP</label>';
                modal_content += '    <input id="column_wip" name="column_wip" value="' + state.wip + '" type="text">';
                modal_content += '</div>';
                modal_content += '</div>';
                modal_content += '<div class="row"><div class="col-md-12"><p><i>WIP: Maximum "<strong>Work in Progress</strong>", 0 means unlimited</i></p></div></div>';
                modal_content += '<input name="column_code" value="' + state.id + '" type="hidden">';
                modal_content += '<input name="column_index" value="' + state.index + '" type="hidden">';

                modal({
                    type: 'primary',
                    title: 'Edit State',
                    text: modal_content,
                    buttons: [{
                            text: 'Cancel',
                            val: false,
                            eKey: false,
                            addClass: 'btn-white',
                            onClick: function (dialog) {
                                $(dialog.html).find('a.modal-close-btn').click();
                            }
                        }, {
                            text: 'Save',
                            val: true,
                            eKey: true,
                            addClass: 'btn-light-blue',
                            onClick: function (dialog) {
                                var $dialog = $(dialog.html);
                                cols[state.id] = {};
                                cols[state.id].label = $dialog.find('input[name="column_label"]').val(),
                                cols[state.id].wip = $dialog.find('input[name="column_wip"]').val();
                                methods.updateColumns(cols);
                                $(dialog.html).find('a.modal-close-btn').click();
                            }
                        }, ],
                    template: '<div id="new_column" class="modal-box"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></div>',
                    _classes: {
                        box: '.modal-box',
                        boxInner: ".modal-inner",
                        title: '.modal-title',
                        content: '.modal-text',
                        buttons: '.modal-buttons',
                        closebtn: '.modal-close-btn'
                    }
                });
            });

            /*  new card  */
            $('body').on('click', '.add_card_to_column',function(){
                var $col = $(this).closest('.col_state');
                var $new = $col.find('.new');
                $new.click();
            });
            $('#board').on('click', '.new', function (e) {
                e.preventDefault();
                var $this = $(this);
                var state_id = $(this).closest('.col_state').attr('id').replace('state_', '')
                var x_state = methods.getStateById(state_id);
                var story = methods.newCardObject({
                    state: x_state.id,
                    index: x_state.cards.length + 1
                });
                
                var $box = $('<div class="box"></div>');
                var $buttons = $('<div class="buttons"></div>');
                var $textarea = $('<textarea class="add_card"></textarea>');
                var $save = $('<button type="submit" value="Submit" class="positive">Submit</button>');
                var $cancel = $('<button type="reset" value="x">x</button>');
                
                $box.html('');
                $box.append($textarea);
                $buttons.append($save);
                $buttons.append($cancel);
                $box.append($buttons);
                $box.insertAfter($this);
                $this.hide();
                $textarea.focus();
                $('html, body').animate({
                    scrollTop: $textarea.offset().top-50
                }, 2000);
                hidden_div.css('width', $textarea.width());
                $('body').append(hidden_div);
                $textarea.on('keyup', function () {
                    var content = $(this).val();
                    content = content.replace(/\n/g, '<br>');
                    hidden_div.html(content + '<br class="lbr">');
                    $(this).css('height', hidden_div.outerHeight()+4);
                });
                var cancel = function(){
                    $box.remove();
                    $this.show();
                };
                $cancel.on('click',cancel);
                $textarea.trigger('keyup');
                $save.on('click',function(e){
                    var val = $textarea.val();
                    val = val.trim();
                    if(!isEmpty(val)){
                        story.title = val;
                        methods.addCard(story,function(){
                            $box.remove();
                            $this.show();
                        });
                        
                    }
                });
                $textarea.on('blur focusout',cancel);
            });
    

            $('body').on('click', 'a.kanban_info', function (e) {
                e.preventDefault();
                var $this = $(this);
                var modal_info = '<h4>Some tips on how to use the dashboard</h4>';
                modal_info += '<ul>';
                modal_info += '    <li><strong>Create new Column/State</strong>: Click "New Column" in the top navigation</li>';
                modal_info += '    <li><strong>Change Card Color</strong>: Click "<i title="Change Card Color" class="glyphicon glyphicon-modal-window"></i>" on the top of the card</li>';
                modal_info += '    <li><strong>Edit Card</strong>: Click "<i title="Edit Card" class="glyphicon glyphicon-edit"></i>" on the top of the card you want to edit or just click the content part of the card.</li>';
                modal_info += '    <li><strong>Discard changes</strong>: Click "cancel", click anywhere outside the editing box or press "esc"</li>';
                modal_info += '    <li><strong>Change order</strong>: Easy, peasy: just drag the top portion of the card or a column to a new position</li>';
                modal_info += '</ul>';
                modal({
                    type: 'info',
                    title: 'Using Kanban', //Modal Title
                    text: modal_info,
                    callback: function (result) {
                        console.log(this);
                    }
                });
            });

            $('#navigation').on('click', '.users-list', function (e) {
                e.preventDefault();
                $(this).toggleClass('users-highlight');
                var user_id = $(this).attr('rel');
                var cards = methods.getUserCards(user_id);
                for (var k in cards) {
                    if ($('#board li[data-id="' + cards[k] + '"]').hasClass('highlight')) {
                        $('#board li[data-id="' + cards[k] + '"]').removeClass('highlight');
                    } else {
                        $('#board li[data-id="' + cards[k] + '"]').addClass('highlight');
                    }
                }
            });

            $('body').on('keypress','#new-todo',function(e) {
                var $this = $(this);
                var $todoList = $('#todo-list');
                if (e.which === 13) {
                    var val = $this.val();
                    var card_id = $(this).closest('section').attr('id').replace('tasks_','');
                    methods.addTask(card_id,val,function(){
                        console.log(this);
                        var todos = methods.buildTask(this);
                        $this.val('');
                        $todoList.append(todos);
                    });
                    
                    //runBind();
                    //$('#main').show();
                    return false;
                }
            });
            var task_editing = false;
            $('body').on('click','.edit_task',function () {
                    var $this = $(this).closest('li').find('.task_label');
                    var $task_option = $(this).closest('li').find('.task_option');
                    var $task_option_content = $task_option.contents();
                    var card_id = $this.closest('section').attr('id').replace('tasks_','');
                    var task_id = $this.closest('li').attr('id').replace('task_','');
                    var editableText = $("<div class=\"task_editable_task\"><input /></div>");
                    var card = app_data.raw_cards[card_id];
                    var tasks = card.tasks;
                    var task = card.tasks[task_id];
                    
                    editableText.find('input').val(task.task);
                    $this.html(editableText);
                    $task_option.html("<i class=\"glyphicon glyphicon-ok-sign edit_task_submit\" title=\"Submit\"></i> <i class=\"glyphicon glyphicon-remove-sign edit_task_cancel\" title=\"Cancel\"></i>");
                    editableText.find('input').focus();

                    var callback = function (e) {
                        var val = $(this).val();
                            val = val.trim();
                        if(!isEmpty(val)){
                            $this.html(val);
                            if(task.task != val){
                                methods.updateTask(card_id,{
                                    id: task_id,
                                    task: val
                                },function(){
                                    $this.html(this.task);
									$task_option.html($task_option_content);
                                });
                            }
                        }
                    };
					
                    editableText.on('keypress','input',function (e) {
                        if (e.which === 13) {
                            callback.call(this);
							e.preventDefault();
                        }
                    });

					$('.edit_task_submit').on('click',function(){
						callback.call(editableText.find('input'));
					});


					$('.edit_task_cancel').on('click',function(){
						$this.html(task.task);
						$task_option.html($task_option_content);
					});
            });

            $('body').on('click', '.remove_task', function(e) {
                e.preventDefault();
                var $this = $(this);
                var card_id = $this.closest('section').attr('id').replace('tasks_','');
                var $currentListItem = $this.closest('li');
                var task_id = $currentListItem.attr('id').replace('task_','');
                methods.removeTask(card_id,task_id,function(){
                    $currentListItem.remove();
                });
            });

            $('body').on('click','.toggle_completion', function(e) {
                var $this = $(this);
                var card_id = $this.closest('section').attr('id').replace('tasks_','');
                var task_id = $this.closest('li').attr('id').replace('task_','');
                var done = 0;
                var $currentListItemLabel = $this.closest('li').find('.task_label');
                if ( $currentListItemLabel.attr('data') == '' ) {
                    done = 1;
                }                

                methods.updateTask(card_id,{
                    id: task_id,
                    done: done
                },function(){
                    if(done == 1){
                        $currentListItemLabel.attr('data', 'done');
                        $currentListItemLabel.css('text-decoration', 'line-through');
                    } else {
                        $currentListItemLabel.attr('data', '');
                        $currentListItemLabel.css('text-decoration', 'none');
                    }
                });
            });

            $('#board').on('click', '.card_title', function (e) {
                e.preventDefault();
                var card_head_editing = false;
                var card_description_edit = false;
                var $box = $(this).closest('.box');
                var $load = $box.find('.load');
                var story_id = $box.closest('li').attr('data-id');
                $load.addClass('loading');
                methods.loadCard(story_id,function(){
                    $load.removeClass('loading');
                    var story = this;
                   
                    var modal_heading = '';
                    var modal_content = '<div class="form-group">';
                    modal_content += '<div class="card_header_edit">' + story.title + '</div>';

                    modal_content += '<p class="card_item_header">Description <a href="#" class="edit_description" rel="card_description">Add/Edit</a></p>';
                    modal_content += '  <div class="pre" id="card_description">';
                    if(!isEmpty(story.content)){
                        modal_content += converter.makeHtml(story.content);
                    }
                    modal_content += '  </div>';
                    modal_content += '</div>';
                    
                    
                    modal_content += '<div class="row">';
                    modal_content += '<div class="col-md-12">';
                    modal_content += '<section id="tasks_'+story_id+'" class="tasks_section">';
                    modal_content += '<label for="tasks_'+story_id+'">Tasks:</label>';
                    modal_content += '<ul id="todo-list">';
                    if(!isEmpty(story.tasks)){
                        $.each(story.tasks, function (task_id, task) {
                            modal_content += methods.buildTask(task);
                        });
                    }
                    modal_content += '</ul>';
					modal_content += '<div class="input-group input-group-sm">';
					modal_content += '	<input type="text" class="form-control" id="new-todo" aria-label="What is the task?" placeholder="What needs to be done?">';
					modal_content += '  <span class="input-group-btn">';
					modal_content += '	<button class="btn btn-secondary" type="button">Go!</button>';
					modal_content += '  </span>';
					modal_content += '</div>';
                    modal_content += '</section>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    
                    
                    modal_content += '<div class="row">';
                    modal_content += '<div class="col-md-4">';
                    modal_content += '  <label for="card_user">Assign to:</label>';
                    modal_content += '  <div class="form-group">';
                    modal_content += '  <select class="card_user" id="card_user" name="card_user" multiple="multiple">';
                    modal_content += '  <option value="">None</option>';
                    $.each(methods.getAllUsers(), function (key, value) {
                        var selected = '';
                        if(story.responsible.constructor === Array){
                            if($.inArray( key, story.responsible ) > -1){
                                selected = ' selected="selected"';
                            }
                        } else {
                            if (story.responsible == key) {
                                selected = ' selected="selected"';
                            }
                        }
                        modal_content += '  <option value="' + key + '"' + selected + '>' + value.name + '</option>';
                    });
                    modal_content += '  </select>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    modal_content += '<div class="col-md-4">';
                    modal_content += '  <label for="card_color">Color:</label>';
                    modal_content += '  <div class="form-group">';
                    modal_content += '  <select class="card_color" id="card_color" name="card_color">';
                    var color = 0;
                    $.each(possible_colors, function (key, value) {
                        var selected = '';
                        if (story.color == key) {
                            selected = ' selected="selected"'
                        }

                        modal_content += '  <option value="' + key + '"' + selected + ' class="color_' + key + '"><i class="glyphicon glyphicon-modal-window color_' + key + '"></i> ' + value + '</option>';
                    });
                    modal_content += '  </select>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    modal_content += '<div class="col-md-4">';
                    modal_content += '  <label for="card_state">State:</label>';
                    modal_content += '  <div class="form-group">';
                    modal_content += '  <select class="card_state" id="card_state" name="card_state">';
                    var color = 0;
                    $.each(methods.getAllStates(), function (key, value) {
                        var selected = '';
                        if (story.state == value.id) {
                            selected = ' selected="selected"'
                        }
                        modal_content += '  <option value="' + value.id + '"' + selected + '>' + value.label + '</option>';
                    });
                    modal_content += '  </select>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    modal_content += '<input name="card_id" value="' + story.id + '" type="hidden">';
                    modal_content += '<div class="row">';
                    modal_content += '<div class="col-md-12">';
                    modal_content += '<div class="card_block_header">';
                    modal_content += 'Due';
                    modal_content += '</div>';
                    modal_content += '<label>Date: <input type="text" size="12" placeholder="dd/mm/yyyy" name="duedate"></label> ';
                    modal_content += '<label>Time: <input type="text" size="12" name="duettime"> <small>(eg. 18:17 or 6:17pm)</small></label>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    
                    modal_content += '<div class="row">';
                    modal_content += '<div class="col-md-12">';
                    modal_content += '<div class="card_block_header">';
                    modal_content += 'Comments:';
                    modal_content += '</div>';
                    
                    modal_content += '<div id="card_comment" rel="' + story.id + '">';
                    modal_content += '    <textarea class="comment_textarea" placeholder="Write a comment..."></textarea>';
                    modal_content += '    <div class="buttons">';
                    modal_content += '        <button type="submit" value="Submit" class="positive comment_submit">Submit</button>';
                    modal_content += '        <button type="reset" value="x" class="comment_reset">x</button>';
                    modal_content += '    </div>';
                    modal_content += '</div>';
                    modal_content += '<div class="card_block_header">';
                    modal_content += 'Activities:';
                    modal_content += '</div>';
                    modal_content += '<ul id="comments_'+story.id+'" class="card_comments">';
                    if(!isEmpty(story.comments)){
                        var comments = reverseObject(story.comments);
                        $.each(comments,function(i,comment){
                           modal_content += methods.buildComment(comment);
                        });
                    }
                    modal_content += '</ul>';
                    modal_content += '</div>';
                    modal_content += '</div>';
                    modal({
                        title: modal_heading,
                        text: modal_content,
                        buttons: [{
                                text: 'Close',
                                val: false,
                                eKey: false,
                                addClass: 'btn-white',
                                onClick: function (dialog) {
                                    $(dialog.html).find('a.modal-close-btn').click();
                                }
                            }],
                        template: '<div id="edit_card" class="box modal-box container"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></div>',
                        _classes: {
                            box: '.modal-box',
                            boxInner: ".modal-inner",
                            title: '.modal-title',
                            content: '.modal-text',
                            buttons: '.modal-buttons',
                            closebtn: '.modal-close-btn'
                        }
                    });
                    
                    $('#card_comment textarea.comment_textarea').on('focus',function(){
                        var $this = $(this);
                        hidden_div.css('width', $this.width());
                        $('body').append(hidden_div);
                        $this.on('keyup', function () {
                            var content = $(this).val();
                            content = content.replace(/\n/g, '<br>');
                            hidden_div.html(content + '<br class="lbr">');
                            $(this).css('height', hidden_div.outerHeight()+4);
                        });
                        $this.trigger('keyup');
                        
                        $('#card_comment .buttons').slideDown();
                    });

                    $('body').on('click','.comment_edit',function(e){
                        e.preventDefault();
                        var $this = $(this);
                        var card_id = $this.closest('.card_comments').attr('id').replace('comments_','');
                        var comment_id = $this.attr('rel');
                        
                        var $content = $this.closest('.comment_container').find('.comment_content');
                        var $textarea = $("<textarea class=\"textarea\"></textarea>");
                        var $save = $('<button type="submit" value="Submit" class="positive">Submit</button>');
                        var $cancel = $('<button type="reset" value="x">x</button>');
                        var $buttons = $('<div class="buttons"></div>');
                        var content = null;
                        var comment = story.comments[comment_id];
                        var $comment_item = $this.closest('#comment_'+ comment.id );
                        
                        
                        $content.html('');
                        $textarea.val(comment.text);
                        $content.append($textarea);
                        $buttons.append($save);
                        $buttons.append($cancel);
                        $content.append($buttons);
                        $textarea.focus();
                        
                        hidden_div.css('width', $textarea.width());
                        $('body').append(hidden_div);
                        $textarea.on('keyup', function () {
                            content = $(this).val();
                            content = content.replace(/\n/g, '<br>');
                            hidden_div.html(content + '<br class="lbr">');
                            $(this).css('height', hidden_div.outerHeight()+4);
                        });
                        $textarea.trigger('keyup');
                        $save.on('click',function(e){
                            var val = $textarea.val();
                            if(isEmpty(val)){
                                $comment_item.replaceWith( methods.buildComment(comment));
                                return;
                            }
                            if(comment.text != val){
                                methods.updateComment(card_id, comment_id, val, function(){
                                    story.comments[this.id] = this;
                                    $comment_item.replaceWith( methods.buildComment(this));
                                    methods.updateCard(story.id,story);
                                });
                                
                            } else {
                                $comment_item.replaceWith( methods.buildComment(comment));
                            }
                        });

                        $cancel.on('click',function(e){
                            if(!isEmpty(comment.text)){
                                console.log(comment);
                                $(this).closest('#comment_'+ comment.id ).replaceWith( methods.buildComment(comment));
                            }
                        });

                    });

                    $('body').on('click','.comment_delete',function(e){
                        e.preventDefault();
                        var $this = $(this);
                        var card_id = $this.closest('.card_comments').attr('id').replace('comments_','');
                        var comment_id = $this.attr('rel');
                        methods.removeComment(card_id, comment_id, function(){
                            delete story.comments[this.id];
                            $this.closest('.comment_item').slideUp().remove();
                            story.comments[this.id] = this;
                            methods.buildBoard();
                        });

                    });

                    $('body').on('click','#card_comment button.comment_submit',function(e){
                        e.preventDefault();
                        var card_id = $(this).closest('#card_comment').attr('rel');
                        var val = $('#card_comment textarea.comment_textarea').val();
                        methods.addComment(card_id,val, function(){
                            $('#card_comment textarea.comment_textarea').val('');
                            hidden_div.html('');
                            $('#card_comment textarea.comment_textarea').css('height', hidden_div.outerHeight()+4);
                            $('#comments_'+card_id).prepend(methods.buildComment(this));
                            $('#card_comment .buttons').slideUp();
                            story.comments[this.id] = this;
                        });
                    });
                    
                    $('body').on('click','#card_comment button.comment_reset',function(e){
                        e.preventDefault();
                        $('#card_comment textarea.comment_textarea').val('');
                        $('#card_comment .buttons').slideUp();
                    });
                    
                    $('#card_user').selectric({});
                    $('#card_user').on('selectric-change', function(element) {
                        var val = $(this).val();
                            story.responsible = val;
                            methods.updateCard(story.id,story);
                            methods.buildBoard();
                    });
                    $('#card_color').selectric();
                    $('#card_color').on('selectric-change', function(element) {
                        var val = $(this).val();
                            story.color = val;
                            methods.updateCard(story.id,story);
                            methods.buildBoard();
                    });
                    $('#card_state').selectric();
                    $('#card_state').on('selectric-change', function(element) {
                        var val = $(this).val();
                            story.state = val;
                            methods.updateCard(story.id,story);
                            methods.buildBoard();
                    });
                    $('.edit_description').on('click',function(e){
                        e.preventDefault();
                        var $this = $(this);
                        var rel = $this.attr('rel');
                        var $desciption = $('#' + rel);
                        var $dialog = $(this).closest('#edit_card');   
                        var $textarea = $("<textarea></textarea>");
                        var $save = $('<button type="submit" value="Submit" class="positive">Submit</button>');
                        var $cancel = $('<button type="reset" value="x">x</button>');
                        var $buttons = $('<div class="buttons"></div>');

                        var content = null;
                        $desciption.html('');
                        $textarea.val(story.content);
                        $desciption.append($textarea);
                        $buttons.append($save);
                        $buttons.append($cancel);
                        $desciption.append($buttons);
                        $textarea.focus();
                        
                        hidden_div.css('width', $textarea.width());
                        $('body').append(hidden_div);
                        $textarea.on('keyup', function () {
                            content = $(this).val();
                            content = content.replace(/\n/g, '<br>');
                            hidden_div.html(content + '<br class="lbr">');
                            $(this).css('height', hidden_div.outerHeight()+4);
                        });
                        $textarea.trigger('keyup');
                        $save.on('click',function(e){
                            var val = $textarea.val();
                            if(!isEmpty(val)){
                                $desciption.html(converter.makeHtml(val));
                            }
                            if(story.content != val){
                                story.content = val;
                                methods.updateCard(story.id,story);
                                methods.buildBoard();
                            }
                        });

                        $cancel.on('click',function(e){
                            if(!isEmpty(story.content)){
                                $desciption.html(converter.makeHtml(story.content));
                            }
                        });
                        
                    });
                    $('.card_header_edit').on('click',function () {
                        if(!card_head_editing){
                            card_head_editing = true;
                            var $dialog = $(this).closest('#edit_card');   
                            var editableText = $("<input />");
                            editableText.val(story.title);
                            $(this).html(editableText);
                            editableText.focus();
                            $dialog.on('blur focusout','input',function () {
                                var val = $(this).val();
                                if(!isEmpty(val)){
                                    $(this).parent().html(val);
                                    card_head_editing = false;
                                    if(story.title != val){
                                        story.title = val;
                                        methods.updateCard(story.id,story);
                                        methods.buildBoard();
                                    }
                                }

                            });
                        }
                    });                    
                    
                });
 
            });

            $('#board').on('click', '.clear_column', function (e) {
                e.preventDefault();
                var state_id = $(this).closest('.col_state').attr('id').replace('state_', '');
                var $wip = $(this).closest('.col_state').find('.state_wip');
                var state = methods.getStateById(state_id);
                modal({
                    type: 'confirm',
                    title: 'Clear Column',
                    text: 'Are you sure you want to remove column "' + state.label + '"?',
                    callback: function (result) {
                        if (result) {
                            methods.clearState(state_id,function(){
                                $wip.html('[0/'+ state.wip +']');
                            });
                        }
                    }
                });
            });

            $('#board').on('click', '.delete', function (e) {
                e.preventDefault();
                var story_id = $(this).closest('li').attr('data-id');
                var story = methods.getCardById(story_id);
                modal({
                    type: 'confirm',
                    title: 'Remove Card',
                    text: 'Are you sure you want to remove "' + story.title + '"?',
                    callback: function (result) {
                        if (result) {
                            methods.removeCard(story_id);
                        }
                    }
                });
            });

            $('#board').on('click', '.archive_cards', function (e) {
                e.preventDefault();
                var state_id = $(this).closest('.col_state').attr('id').replace('state_', '');
                var state = methods.getStateById(state_id);
                modal({
                    type: 'confirm',
                    title: 'Archive Cards',
                    text: 'Are you sure you want to move cards from "' + state.label + '" to archive?',
                    callback: function (result) {
                        if (result) {
                            methods.archiveStateCards(state_id);
                        }
                    }
                });
            });

            $('#board').on('click', '.remove_column', function (e) {
                e.preventDefault();
                var $this = $(this);
                var $column = $this.closest('.col_state');
                var state_id = $column.attr('id').replace('state_', '');
                var state = methods.getStateById(state_id);

                modal({
                    type: 'confirm',
                    title: 'Remove Column',
                    text: 'Are you sure you want to remove column "' + state.label + '"?',
                    callback: function (result) {
                        if (result) {
                            $column.remove();
                            methods.removeColumn(state_id);
                        }
                    }
                });
            });
            ///////////////////////////////////TOP BAR/////////////////////////////////////
            $('#top-bar').on('click', '.export', function (e) {
                e.preventDefault();
                window.location=methods.getApiUrl()+"?action=export"
            });

            $('#top-bar').on('click', '.import', function (e) {
                var modal_content = '<input name="file" type="file" />';
                modal_content += '<input type="button" value="Upload" />';
                modal_content += '<progress></progress>';
                modal({
                    title: 'Import Data',
                    text: modal_content,
                    buttons: [{
                            text: 'Upload',
                            val: false,
                            eKey: false,
                            addClass: 'btn-white',
                            onClick: function (dialog) {
                                $( "#target" ).submit(function( event ) {
                                    event.preventDefault();
                                });
                                $('#import_file').find('a.modal-close-btn').click();
                            }
                        }],
                    template: '<form id="import_file" enctype="multipart/form-data" action="'+methods.getApiUrl()+'?action=import" class="box modal-box container"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></form>',
                    _classes: {
                        box: '.modal-box',
                        boxInner: ".modal-inner",
                        title: '.modal-title',
                        content: '.modal-text',
                        buttons: '.modal-buttons',
                        closebtn: '.modal-close-btn'
                    }
                });
            });
        };
        
        methods.ready();
    };
}(jQuery));