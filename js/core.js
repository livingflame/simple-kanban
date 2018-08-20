(function ($) {
	"use strict";
    $.kanban = function (options) {
		var settings = $.extend({
			user: 	    'user1',
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
            hidden_div: $(document.createElement('div')),
            log: function(event){
                console.log(event);
            }
		}, options);

        var methods = {};
        var api_url = settings.api_url;
        var app_data = {
            people: {},
            state_index: [],
            states: []
        };
        var current_user = settings.user;
        var possible_colors = settings.colors;
        var converter = settings.converter;
        var hidden_div = settings.hidden_div;
        var logEvent = settings.log;

        function isEmpty(str) {
            return (!str || 0 === str.length);
        }
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

        methods.loadBoard = function () {
            logEvent('Fetching data');
            $.ajax({
                type: 'GET',
                url: api_url,
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
            logEvent('Fetching data: Users');
            $.ajax({
                type: 'GET',
                url: api_url,
                data: {
                    action: 'load_users'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_people = data;
                    logEvent('Fetched Data: Users');
                }
            });
        };

        methods.saveUsers = function () {
            var data = JSON.stringify(app_data.raw_people);
            logEvent('Saving data: Users');
            if (data === '') {
                data = {};
            }
            $.ajax({
                type: 'POST',
                url: api_url + '?action=save_users',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    logEvent('Saved data: Users');
                }
            });
        };

        methods.loadStates = function () {
            logEvent('Fetching data: States');
            $.ajax({
                type: 'GET',
                url: api_url,
                data: {
                    action: 'load_columns'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_states = data;
                    logEvent('Fetched Data: States');
                }
            });
        };

        methods.saveStates = function () {
            var data = JSON.stringify(app_data.raw_states);
            logEvent('Saving data: States');
            if (data === '') {
                data = {};
            }
            $.ajax({
                type: 'POST',
                url: api_url + '?action=save_columns',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    logEvent('Saved data: States');
                }
            });
        };

        methods.loadCards = function () {
            logEvent('Fetching data: Cards');
            $.ajax({
                type: 'GET',
                url: api_url,
                data: {
                    action: 'load_cards'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_cards = data;
                    logEvent('Fetched Data: Cards');
                }
            });
            //return raw_cards;
        };

        methods.saveCards = function () {
            var data = JSON.stringify(app_data.raw_cards);
            logEvent('Saving data: Cards');
            if (data === '') {
                data = {};
            }
            $.ajax({
                type: 'POST',
                url: api_url + '?action=save_cards',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    logEvent('Saved data: Cards');
                }
            });
        };

        methods.loadArchives = function () {
            logEvent('Fetching data: Archived Cards');
            $.ajax({
                type: 'GET',
                url: api_url,
                data: {
                    action: 'load_archives'
                },
                dataType: 'json',
                success: function (data) {
                    if (data === null) {
                        data = {};
                    }
                    app_data.raw_cards = data;
                    logEvent('Fetched Data: Cards');
                    methods.buildBoard();

                }
            });
            //return raw_cards;
        };

        methods.saveArchives = function (archives) {
            var data = JSON.stringify(archives);
            logEvent('Saving data: Archived Cards');
            if (data === '') {
                data = {};
            }
            $.ajax({
                type: 'POST',
                url: api_url + '?action=save_archives',
                data: {
                    data: data
                },
                dataType: 'json',
                success: function (data) {
                    logEvent('Saved data: Cards');
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

        methods.deleteCard = function(story_id){
            delete app_data.raw_cards[story_id];
            methods.saveCards();
        };

        methods.updateCard = function(story_id,story){
            app_data.raw_cards[story_id] = story;
            methods.saveCards();
        };
        
        methods.getCardById = function(card_id){
            return app_data.raw_cards[card_id];
        };

        methods.getStateById = function(state_id){
            var state = app_data.raw_states[state_id];
            var index = app_data.state_index[state.id];
            return app_data.states[index];
        };

        methods.deleteState = function(state_id){
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

            methods.saveStates();
        };
        
        methods.updateState = function(state_id,state){
            app_data.raw_states[state_id] = state;
            methods.saveStates();
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
            if (object2.id === null || object2.id === undefined) {
                object2.id = new Date().getTime();
            }
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

        methods.clearState = function (state_id) {
            var state_index = app_data.state_index[state_id];
            $.each(app_data.states[state_index].cards, function (i, card) {
                delete app_data.raw_cards[card];
            });

            app_data.states[state_index].cards = [];
            methods.saveCards();
            methods.buildBoard();
        };

        methods.archiveStateCards = function (state_id) {
            var state_index = app_data.state_index[state_id];
            var archives = {};
            $.each(app_data.states[state_index].cards, function (i, card) {
                archives[card] = app_data.raw_cards[card];
                delete app_data.raw_cards[card];
            });

            app_data.states[state_index].cards = [];
            methods.saveArchives(archives);
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
            if(!$.isArray(app_data.people[user_id].cards)){
                app_data.people[user_id].cards = [];
            }
            app_data.people[user_id].cards.push(story);
        };
        
        methods.makeUserResponsibleToCard = function (user_id, story) {
            if(!isEmpty(user_id)){
                if($.isArray(user_id)){
                    $.each(user_id, function (i, res) {
                        
                        methods.cardToUser(user_id[i],story);
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
        /**
         * callback when an element has moved
         */
        methods.droppedCard = function () {
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
                story.state = state.id;
                if ((state.wip == 0) || state.cards.length + 1 <= state.wip) {
                    $(this).closest('ul.state').children().each(function () {
                        var id = $(this).attr('data-id');
                        app_data.raw_cards[id].index = $(this).closest('ul.state').find('li').index(this);
                    });
                }
                methods.saveCards();
                methods.buildBoard();
            }
        };

        methods.droppedColumn = function () {
            $(this).closest("#board").find('.col_state').each(function () {
                var index = $(this).attr('id').replace("state_", "");
                app_data.raw_states[index].index = $(this).parent().find('.col_state').index(this);
            });
            methods.saveStates();
        }

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
            content += '     <li><a href="#" class="edit_column"><i title="Edit Column" class="glyphicon glyphicon-edit edit"></i> Edit column</a></li>';
            content += '     <li><a href="#" class="new"><i class="glyphicon glyphicon-plus-sign"></i> Add a new Card</a></li>';
            content += '     <li><a href="#" class="remove_column"><i class="glyphicon glyphicon-remove-sign"></i> Remove this column</a></li>';
            content += '     <li><a href="#" class="clear_column"><i class="glyphicon glyphicon-unchecked"></i> Remove all Cards</a></li>';
            content += '     <li><a href="#" class="archive_cards"><i class="glyphicon glyphicon-compressed"></i> Archive all Cards</a></li>';
            content += '</ul>';
            content += '</div>';
            content += '<ul class="state" id="list_' + state.id + '">';
            var cards = state.cards;
            $.each(cards, function (x, card) {
                content += methods.createStoryItem(card);
            });
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

        methods.createStoryItem = function (story_id) {
            var story = app_data.raw_cards[story_id];
            
            var content = "<li data-id='" + story.id + "'>";
            content += '<div id="card_' + story.id + '" class="box color_' + story.color + '">';
            content += "<div class=\"card_top\">";
            content += '<span class="card_actions">';
            content += '<i class="glyphicon glyphicon-remove delete" title="Remove Card"></i> ';
            content += '</span>';
            content += "<div class=\"card_info\">";
           
            if (story.responsible) {
                if($.isArray(story.responsible)){
                    $.each(story.responsible, function (i, responsible) {
                        var user = methods.getUserById(responsible);
                        if($.isPlainObject(user)){
                            content += "<img src=\"userfiles/photos/" + user.photo + "\" alt=\"" + user.username + "\" title=\"" + user.name + "\">";
                        }
                    });
                } else {
                    var user = methods.getUserById(story.responsible);
                    if($.isPlainObject(user)){
                        content += "<img src=\"userfiles/photos/" + user.photo + "\" alt=\"" + user.username + "\" title=\"" + story.name + "\">";
                    }
                    
                }
                methods.makeUserResponsibleToCard(story.responsible, story.id);
            }
            if (story.comments.length > 0) {
                content += '<span class="card_comment" title="Comments"><i class="glyphicon glyphicon-comment"></i> ' + story.comments.length + '</span> ';
            }
            if (story.attachments.length > 0) {
                content += '<span class="card_attachments" title="Attachments"><i class="glyphicon glyphicon-paperclip"></i> ' + story.attachments.length + '</span> ';
            }
            if (story.tasks.length > 0) {
                content += '<span class="card_tasks" title="Tasks"><i class="glyphicon glyphicon-tasks"></i> 2/2</span> ';
            }
            content += "</div>";
            content += "</div>";
            content += "<div class=\"card_title\">" + story.title + "</div>";
            content += "</div>";
            content += '</li>';
            
            return content;
        };

        methods.buildData = function () {
            logEvent('Organizing data...');
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
            logEvent('Data organized');
            console.log(app_data);
        };

        methods.buildBoard = function () {
            methods.buildData();
            logEvent('Building board...');
            var board = $('#board');
            $('#board').empty();
            $.each(app_data.states, function (i, state) {
                if (state !== null && typeof state === 'object') {
                    board.append(methods.createColumn(i, state));
                }
            });
            logEvent('Board build...');
            methods.createPeopleList();
            methods.enableDrag();
            logEvent('Board built...');
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
                var state = methods.newColumnObject({});
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

                modal({
                    type: 'primary',
                    title: 'New State',
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
                            text: 'New State',
                            val: true,
                            eKey: true,
                            addClass: 'btn-light-blue',
                            onClick: function (dialog) {
                                var $dialog = $(dialog.html);
                                state.label = $dialog.find('input[name="column_label"]').val(),
                                state.wip = $dialog.find('input[name="column_wip"]').val(),
                                methods.updateState(state.id,state);
                                methods.buildBoard();
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

            /*  edit state  */
            $("#board").on('click', '.edit_column', function (e) {
                e.preventDefault();
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
                                state.label = $dialog.find('input[name="column_label"]').val(),
                                state.wip = $dialog.find('input[name="column_wip"]').val(),
                                methods.updateState(state.id,state);
                                methods.buildBoard();
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
            $('#board').on('click', '.new', function (e) {
                e.preventDefault();
                var card_head_editing = false;
                var card_description_edit = false;
                var state_id = $(this).closest('.col_state').attr('id').replace('state_', '')
                var x_state = methods.getStateById(state_id);
                var story = methods.newCardObject({
                    state: x_state.id,
                    index: x_state.cards.length + 1
                });
                var modal_heading = '<label for="card_title">Title*:</label>';
                modal_heading += '<input class="editBox" id="card_title" name="title" value="" type="text">';
                var modal_content = '<div class="form-group">';
                modal_content += '<div id="card_description"><p>Add a description...</p></div>';
                modal_content += '</div>';
                modal_content += '<div class="row">';
                modal_content += '<div class="col-md-4">';
                modal_content += '  <label for="card_user">Assign to to:</label>';
                modal_content += '  <div class="form-group">';
                modal_content += '  <select class="card_user" id="card_user" name="card_user" multiple="multiple">';
                $.each(methods.getAllUsers(), function (key, value) {
                    modal_content += '  <option value="' + key + '">' + value.name + '</option>';
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
                    modal_content += '  <option value="' + key + '">' + value + '</option>';
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
                    modal_content += '  <option value="' + value.id + '">' + value.label + '</option>';
                });
                modal_content += '  </select>';
                modal_content += '</div>';
                modal_content += '</div>';

                modal({
                    type: 'primary',
                    title: modal_heading,
                    text: modal_content,
                    buttons: [{
                            text: 'Cancel',
                            val: false,
                            eKey: false,
                            addClass: 'btn-white',
                            onClick: function (dialog) {
                                $(dialog.html).find('a.modal-close-btn').click();
                                card_description_edit = false;
                            }
                        }, {
                            text: 'New Card',
                            val: true,
                            eKey: true,
                            addClass: 'btn-light-blue',
                            onClick: function (dialog) {
                                var $dialog = $(dialog.html);
                                story.title = $dialog.find('input[name="title"]').val();
                                if(!isEmpty(story.title)){
                                    methods.updateCard(story.id,story);
                                    $dialog.find('a.modal-close-btn').click();
                                    card_description_edit = false;
                                    methods.buildBoard();
                                } else {
                                    showNotification({
                                        type : "error",
                                        message: 'Please make sure all required fields are fillled up!',
                                        autoClose: true,
                                        duration: 10
                                    });
                                }
            
                            }
                        }, ],
                    template: '<div id="new_card" class="modal-box"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></div>',
                    _classes: {
                        box: '.modal-box',
                        boxInner: ".modal-inner",
                        title: '.modal-title',
                        content: '.modal-text',
                        buttons: '.modal-buttons',
                        closebtn: '.modal-close-btn'
                    }
                });
                $('#card_user').selectric({});
                $('#card_user').on('selectric-change', function(element) {
                    var val = $(this).val();
                        story.responsible = val;
                });
                $('#card_color').selectric();
                $('#card_color').on('selectric-change', function(element) {
                    var val = $(this).val();
                        story.color = val;

                });
                $('#card_state').selectric();
                $('#card_state').on('selectric-change', function(element) {
                    var val = $(this).val();
                        story.state = val;
                });
                $('div#card_description').on('click',function () {
                    if(!card_description_edit){
                        card_description_edit = true;
                        var $dialog = $(this).closest('#new_card');   
                        var textarea = $("<textarea></textarea>");
                        var content = null;
                        
                        textarea.val(story.content);
                        $(this).html(textarea);
                        textarea.focus();
                        hidden_div.css('width', textarea.width());
                        $('body').append(hidden_div);
                        textarea.on('keyup', function () {
                            content = $(this).val();
                            content = content.replace(/\n/g, '<br>');
                            hidden_div.html(content + '<br class="lbr">');
                            $(this).css('height', hidden_div.outerHeight()+4);
                        });
                        textarea.trigger('keyup');            
                        $dialog.on('blur focusout','textarea',function () {
                            var val = $(this).val();
                            if(isEmpty(val)){
                                $(this).parent().html('<p>Add a description...<p>');
                            } else {
                                $(this).parent().html(converter.makeHtml(val));
                            }
                            
                            card_description_edit = false;
                            if(story.content != val){
                                story.content = val;
                            }
                        });
                    }
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
                            $(this).parent().html(val);
                            card_head_editing = false;
                            if(story.title != val){
                                story.title = val;
                            }
                        });
                    }
                });
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
                console.log(cards);
                for (var k in cards) {
                    if ($('#board li[data-id="' + cards[k] + '"]').hasClass('highlight')) {
                        $('#board li[data-id="' + cards[k] + '"]').removeClass('highlight');
                    } else {
                        $('#board li[data-id="' + cards[k] + '"]').addClass('highlight');
                    }
                }
            });

           
         
            $('#board').on('click', '.card_title', function (e) {
                e.preventDefault();
                var card_head_editing = false;
                var card_description_edit = false;
                var $box = $(this).closest('.box');
                var story_id = $box.closest('li').attr('data-id'); 
                var story = methods.newCardObject(methods.getCardById(story_id));
                var modal_heading = '<div class="card_header_edit">' + story.title + '</div>';
                var modal_content = '<div class="form-group">';
                modal_content += '  <div class="pre" id="card_description">';
                if(!isEmpty(story.content)){
                    modal_content += converter.makeHtml(story.content);
                } else {
                    modal_content += '<p>Add a content...</p>';
                }
                modal_content += '  </div>';
                modal_content += '</div>';
                modal_content += '<div class="row">';
                modal_content += '<div class="col-md-4">';
                modal_content += '  <label for="card_user">Assign to:</label>';
                modal_content += '  <div class="form-group">';
                modal_content += '  <select class="card_user" id="card_user" name="card_user" multiple="multiple">';
                modal_content += '  <option value="">None</option>';
                $.each(methods.getAllUsers(), function (key, value) {
                    var selected = '';
                    if($.isArray(story.responsible)){
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
                modal_content += '<ul id="comments_'+story.id+'"></ul>';

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
                $('div#card_description').on('click',function () {
                    if(!card_description_edit){
                        card_description_edit = true;
                        var $dialog = $(this).closest('#edit_card');   
                        var textarea = $("<textarea></textarea>");
                        var content = null;
            
                        textarea.val(story.content);
                        $(this).html(textarea);
                        textarea.focus();
                        
                        hidden_div.css('width', textarea.width());
                        $('body').append(hidden_div);
                        textarea.on('keyup', function () {
                            content = $(this).val();
                            content = content.replace(/\n/g, '<br>');
                            hidden_div.html(content + '<br class="lbr">');
                            $(this).css('height', hidden_div.outerHeight()+4);
                        });
                        textarea.trigger('keyup');            
                        $dialog.on('blur focusout','textarea',function () {
                            var val = $(this).val();
                            if(isEmpty(val)){
                                $(this).parent().html('<p>Add a description...<p>');
                            } else {
                                $(this).parent().html(converter.makeHtml(val));
                            }
                            
                            card_description_edit = false;
                            if(story.content != val){
                                story.content = val;
                                methods.updateCard(story.id,story);
                                methods.buildBoard();
                            }
                        });
                    }
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

            $('#board').on('click', '.clear_column', function (e) {
                e.preventDefault();
                var state_id = $(this).closest('.col_state').attr('id').replace('state_', '');
                var state = methods.getStateById(state_id);
                modal({
                    type: 'confirm',
                    title: 'Clear Column',
                    text: 'Are you sure you want to remove column "' + state.label + '"?',
                    callback: function (result) {
                        if (result) {
                            methods.clearState(state_id);
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
                            methods.deleteState(state_id);
                            methods.buildBoard();
                        }
                    }
                });
            });

            $('#top-bar').on('click', '.export', function (e) {
                e.preventDefault();
                window.location=api_url+"?action=export"
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
                    template: '<form id="import_file" enctype="multipart/form-data" action="'+api_url+'?action=import" class="box modal-box container"><div class="modal-inner"><div class="modal-title"><a class="modal-close-btn"></a></div><div class="modal-text"></div><div class="modal-buttons"></div></div></form>',
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