(function () {
	"use strict";
    
    var Kanban = (function(){
        var method = {};
        
        return method;
    }());

	var app_data = {
		people: {}
	};

    var column_structure = {
        code: 'nc',
        label: 'New Column',
        index: 0
    };

    var card_structure = {
        id: null,
        title: 'New Card',
        content: 'New Card Content',
        responsible: 'user',
        state: null,
        color: 0
    };

	var IN_EDIT_MODE = false;
    
    var possible_colors = [
        'default',
        'primary',
        'success',
        'info',
        'warning',
        'danger'
    ];
    var loadBoard = function(){
        $.ajax({
			type: 'POST',
			url: 'server.php',
			data: {
				action: 'load_column'
			},
			dataType: 'json',
			success: function (data) {
				if (data === null) {
					data = {};
				}
                var states = initStates(data);
                app_data.states = states.states;
                app_data.state_index = states.index;
                createBoard(app_data);
                loadData();
			}
		});  
    };

    var saveBoard = function (data) {
		if (data === '') {
			data = {};
		}
		$.ajax({
			type: 'POST',
			url: 'server.php',
			data: {
				action: 'save_column',
				data: data
			},
			dataType: 'json'
		});
	};

	var loadData = function () {
		$.ajax({
			type: 'POST',
			url: 'server.php',
			data: {
				action: 'load'
			},
			dataType: 'json',
			success: function (data) {
				if (data === null) {
					data = {};
				}
				app_data.rawData = data;
                createStoryList(app_data);
				
				createPeopleList();
			}
		});
		//return rawData;
	};

    var saveData = function (data) {
		if (data === '') {
			data = {};
		}
		$.ajax({
			type: 'POST',
			url: 'server.php',
			data: {
				action: 'save',
				data: data
			},
			dataType: 'json'
		});
	};
    
	var initStates = function (states_input) {
		var states = [];
		var states_index = [];
		if (!$.isArray(states_input)) {
			states_input = [];
		}
        states_input.sort(function(a, b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });

        app_data.raw_states = states_input;

        $.each( states_input, function( i, state ) {
            states_index[ state.code ] = i;
            states.push({code:state.code,label:state.label,wip:state.wip,cards:[]});
        });

		return {
            states: states,
            index:states_index
        };
	};
	var createBoard = function (app_data) {
        console.log(app_data);
        var board = $('#board');
        $('#board div').remove();
        $.each( app_data.states, function( i, state ) {
            if(state !== null && typeof state === 'object'){
               $('#board').append(createColumn(state.code, state.label,i));
            }
        });
        $('#board').dragsort({
			dragSelector: 'div.col_state .column_head',
			dragBetween: true,
			placeHolderTemplate: "<div class='col_state placeholder'>&nbsp</div>",
			dragEnd: dropColumn
		});
        $('#board ul.state').dragsort({
			dragSelector: 'li .title',
			dragBetween: true,
			placeHolderTemplate: "<li class='placeholder'><div>&nbsp</div></li>",
			dragEnd: droppedElement
		});
	};
    var dropColumn = function(){
        $(this).parent().children().each(function() {
            var index = $(this).attr('data-index');
            app_data.raw_states[index].index = $(this).parent().find( '.col_state' ).index( this );
            console.log(this);
        });
        saveBoard(app_data.raw_states);
    }
    
	var createColumn = function (state, headlines, num) {
		var content = '<div id="state_' + state + '" class="col_state state_' + state + '" data-index="' + num + '">';
		content += '<h3 class="column_head">' + headlines + '</h3>';
        content += '<div class="coloption">';
        content += '<a href="#" class="coloption_trigger glyphicon glyphicon-option-horizontal"></a>';
        content += '<ul class="coldropdown">';
        content += '     <li><a href="#" class="new"><i class="glyphicon glyphicon-plus-sign"></i> New Card</a></li>';
        content += '     <li><a href="#" class="remove_column"><i class="glyphicon glyphicon-remove-sign"></i> Remove</a></li>';
        content += '</ul>';
        content += '</div>';
		content += '</div>';
        var $content = $(content);
        $content.append('<ul class="state" id="list_' + state + '" data-index="' + num + '"></ul>');
        $content.append('<div class="new text-center"><i class="glyphicon glyphicon-plus-sign"></i> New Card</div>');
     
		return $content;
	};


    
	var createPeopleList = function () {
		var peopleList = '<form ><ul class="people-list">';
        peopleList += '<li><span class="glyphicon glyphicon-user"></span></li>';
        $.each( app_data.people, function( key, value ) {
            peopleList += '<li><input type="checkbox" name="' + key + '"> ' + key + '</li>';
        });
		peopleList += '</ul></form>';
		$('#navigation').append(peopleList);
	};

    var makeUserResponsibleToCard = function(responsible,story){
		if (app_data.people[responsible] === undefined) {
			app_data.people[responsible] = [];
		} 
        app_data.people[responsible].push(story);
    }
    var getColorName = function(index){
        if(typeof possible_colors[index] === 'undefined') {
            return 'default';
        }
        else {
            return possible_colors[index];
        }
    }
    var createStoryCard = function(story){
        var card_element = $('<div id="card_'+story.id+'" class="box color_' + story.color + ' panel panel-' + getColorName(story.color) + '" ></div>');
        var content = "<div class=\"title panel-heading\">" + story.title + "<button type=\"button\" class=\"edit btn btn-default btn-xs  pull-right\" data-dismiss=\"modal\"><i class=\"glyphicon glyphicon-pencil\"></i></button></div>";
        content += "<div class=\"panel-body\"><div class=\"card_content\">" + story.content + "</div></div>";
        content += "<div class=\"panel-footer\">";
        content += "<div class=\"user_container\">" + story.responsible + "</div>";
        content += '<span><i class="glyphicon glyphicon-comment"></i> 1</span> ';
        content += '<span><i class="glyphicon glyphicon-paperclip"></i> 1</span> ';
        content += '<span class="badge"><i class="glyphicon glyphicon-check"></i> 2/2</span> ';
        content += "</div>";
   
        
        card_element.append(content);
        return card_element;
    }

	var createStoryItem = function (story) {
		var story_element = $("<li data-id='" + story.id + "'></li>");
		story_element.append(createStoryCard(story));
        makeUserResponsibleToCard(story.responsible,story.id);
		return story_element;
	};

	var createStoryList = function (app_data) {
        var needs_update = false;
        $.each( app_data.rawData, function( story_id, card ) {
            var state_key = app_data.state_index[card.state];
            if(typeof app_data.states[state_key] === 'undefined'){
                if(0 in app_data.states){
                    var state = app_data.states[0];
                    needs_update = true;
                    app_data.rawData[story_id].state = state.code;
                    state_key = app_data.state_index[state.code];
                    if(typeof app_data.states[state_key].cards === 'undefined') {
                        app_data.states[state_key].cards=[];
                    }
                    app_data.states[state_key].cards.push(card);
                }
            } else {
               if(typeof app_data.states[state_key].cards === 'undefined') {
                    app_data.states[state_key].cards = [];
                }
                app_data.states[state_key].cards.push(card);
            }
        });
        $.each( app_data.states, function( i, state ) {
            var cards = state.cards;
            cards.sort(function(a, b) {
                return parseInt(a.index) - parseInt(b.index);
            });
            $.each( cards, function( i, card ) {
                $('ul#list_' + card.state).append(createStoryItem(card));
            });
        });
        

        
        if(needs_update){
            saveData(app_data.rawData);
        }
	};


	/**
	 * callback when an element has moved
	 */
	var droppedElement = function () {
		var newState = $(this).parent().attr('id').replace('list_','');
		var story_id = $(this).attr('data-id');
		app_data.rawData[story_id].state = newState;
		
        $(this).parent().children().each(function() {
            var id = $(this).attr('data-id');
            app_data.rawData[id].index = $(this).parent().find( 'li' ).index( this );
            console.log(this);
        });
		saveData(app_data.rawData);
	};

    var newColumnObject = function(object2){
        if(object2.code === null || object2.code === undefined){
            object2.code = 'c' + app_data.states.length;
        }
        if (object2.label === null || object2.label === undefined) {
			object2.label = 'Column ' + app_data.states.length;
		}
        if (object2.index === null || object2.index === undefined) {
			object2.index = app_data.states.length;
		}
		return $.extend( {}, column_structure, object2 );
    }
    
	var newCardObject = function (object2) {
        if(object2.id === null || object2.id === undefined){
            object2.id = new Date().getTime();
        }
        if (card_structure.state === null) {
            var state = app_data.states[0];
			card_structure.state = state.code;
		}
		return $.extend( {}, card_structure, object2 );
	};
    


	$(document).ready(function () {
		loadBoard();

        $("#board").on('show_col_option','a.coloption_trigger',function(e){
            e.preventDefault();
            $(this).next().toggleClass('show_col_dropdown');
        });
    
        $("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
		// ================= Handlers ======================
        var head_column_clone;
        var divClicked = function () {
            var divHtml = $(this).html();
            var editableText = $("<input />");
            editableText.val(divHtml);
            $(this).html(editableText);
            editableText.focus();
            // setup the blur event for this new textarea
            editableText.blur(editableTextBlurred);
        }

        var editableTextBlurred = function() {
            var val = $(this).val();
            var index = $(this).closest('.col_state').attr('data-index');
            $(this).parent().html(val);
            app_data.raw_states[index].label = val;
            saveBoard(app_data.raw_states);
        }

        $('#board').on('dblclick','.column_head',divClicked);

        $(document).on('click','.new_column',function(e){
            e.preventDefault();
            
            var state = newColumnObject({});
            var index = app_data.states.length;
            
            app_data.states[index] = {cards:new Array(),code:state.code,label:state.label}
            app_data.raw_states[index] = state;
            app_data.state_index[state.code] = index;
            saveBoard(app_data.raw_states);
            $('#board').append(createColumn(state.code, state.label,index));
        });
        
        
        $('#board').on('new','.new',function(e){
            e.preventDefault();
            
			var id = new Date().getTime();
            var state = $(this).closest('.col_state').attr('id').replace('state_','')
			var story = newCardObject({id:id,state:state});
			if (app_data.rawData === undefined) {
				app_data.rawData = {};
			}
			app_data.rawData[id] = story;
			saveData(app_data.rawData);
			var storyHtml = createStoryItem(story);
			$('#list_' + state).append(storyHtml);
			$(storyHtml).find('.edit').trigger('edit');
        });

        $(document).on('click',function(event) {
            if($(event.target).closest('.box').length > 0) {
                if (!IN_EDIT_MODE) {
                    if($(event.target).is('.edit')){
                        event.preventDefault();
                        $(event.target).closest('.box').trigger('edit');
                    }
                } else {
                    if(IN_EDIT_MODE.attr('id') !== $(event.target).closest('.box').attr('id')){
                        IN_EDIT_MODE.find('.cancel').trigger('cancel');
                    }
                    if($(event.target).is('.cancel')){
                        event.preventDefault();
                        $(event.target).trigger('cancel');
                    }
                    if($(event.target).is('.delete')){
                        event.preventDefault();
                        $(event.target).trigger('delete');
                    }
                    if($(event.target).is('.color')){
                        event.preventDefault();
                        $(event.target).trigger('color');
                    }
                    if($(event.target).is('.save')){
                        event.preventDefault();
                        $(event.target).trigger('save');
                    }
                }
            } else {
                if(IN_EDIT_MODE){
                    if(IN_EDIT_MODE.attr('id') !== $(event.target).closest('.box').attr('id')){
                        IN_EDIT_MODE.find('.cancel').trigger('cancel');
                    }
                }
                if($(event.target).is('.new')){
                    event.preventDefault();
                    $(event.target).trigger('new');
                }
                if($(event.target).is('.remove_column')){
                    event.preventDefault();
                    console.log($(event.target));
                    $(event.target).trigger('remove_column');
                }
                if($(event.target).is('a.coloption_trigger')){
                    event.preventDefault();
                    $(event.target).trigger('show_col_option');
                } else {
                    $('a.coloption_trigger').each(function(i,element){
                        if($(this).next().is(':visible')){
                            $(this).trigger('show_col_option');
                        }
                    });
                    
                }
                
            }
        });

		$('#navigation').on('change', '.people-list input', function () {
			var responsible = $(this).attr('name');
			for (var k in app_data.people[responsible]) {
				if ($('#board li[data-id="' + app_data.people[responsible][k] + '"]').hasClass('highlight')) {
					$('#board li[data-id="' + app_data.people[responsible][k] + '"]').removeClass('highlight');
				} else {
					$('#board li[data-id="' + app_data.people[responsible][k] + '"]').addClass('highlight');
				}
			}
		});

		$(document).keyup(function (e) {
			if (e.keyCode === 27) {
                if (IN_EDIT_MODE) {
					IN_EDIT_MODE.find('.cancel').trigger('cancel');
				}
			}
		});
        $('#board').on('edit','.box',function(event){
            var $this = $(this);
            var story_id = $this.closest('li').attr('data-id');
            var oldColor = app_data.rawData[story_id].color;
            
            var $title = $this.find('.title');
            var value = $title.text();
            var $user = $this.find('.user_container');
            var user = $user.text();
            var $content = $this.find('.card_content');
            var content = $content.text();
            var $form = $('<form></form>').attr('id',$this.attr('id')).attr('class',$this.attr('class'));
            $form.append($('<div class="panel-heading"><input type="text" class="editBox" value="' + value + '"/></div>'));
            $form.append($('<div class="panel-body"><textarea class="card_content_textarea">' + content + '</textarea></div>'));
            $form.append('<div class="panel-footer"><div class="user_box"><input type="text" class="userBox" value="' + user + '"/></div><a class="save" href="#">save</a> <a class="cancel" href="#">cancel</a> <a href="#" class="delete">delete</a> <a href="#" class="color">color</a></div>');
            $this.replaceWith($form);

            if($(event.target).is($title)){
                $this.find('.editBox').focus();
            }

            if($(event.target).is($user)){
                $this.find('.userBox').focus();
            }
            IN_EDIT_MODE = $form;
        });
        
		$('#board').on('cancel', '.cancel', function (e) {
            e.preventDefault();
            var $this = $(this);
            var $box = $this.closest('.box');
			var story_id = $this.closest('li').attr('data-id');
            $box.replaceWith(createStoryCard(app_data.rawData[story_id]));
			IN_EDIT_MODE = false;
		});
        
		$('#board').on('remove_column', '.remove_column', function (e) {
            e.preventDefault();
            var $this = $(this);
            var $column = $this.closest('.col_state');
			var index = $column.attr('data-index');
			modal({
				type: 'confirm',
				title: 'Confirm',
				text: 'Are you sure you want to delete this column?',
				callback: function(result) {
                    if(result){
                        $column.remove();
                        var new_states = [];
                        console.log(index);
                        var code = app_data.states[index].code;
                        delete app_data.state_index[code];
                        delete app_data.raw_states[index];
                        $.each(app_data.raw_states,function(i,new_state){
                            if(new_state){
                                new_states.push(new_state);
                            }
                        });
                        delete app_data.states[index];

                        app_data.raw_states = new_states;
                        var states = initStates(new_states);
                        app_data.states = states.states;
                        app_data.state_index = states.index;
                        saveBoard(app_data.raw_states);
                        createBoard(app_data);
                        createStoryList(app_data);
                        console.log(app_data);
                    }
				}
			});
		});

		$('#board').on('delete', '.delete', function (e) {
            e.preventDefault();
            console.log(this);
            modal({
				type: 'confirm',
				title: 'Confirm',
				text: 'Are you sure you want to delete this card?',
				callback: function(result) {
                    if(result){
                        var id = $(this).closest('li').attr('data-id');
                        $(this).closest('li').remove();

                        delete app_data.rawData[id];
                        saveData(app_data.rawData);
                        IN_EDIT_MODE = false;
                    }
				}
			});
		});

        var getBoxColor = function(box){
            var classes = box.attr("class").split(" ");
            var color = 0;
            $.each( classes, function( i, class_name ) {
                var class_split = class_name.split("_");
                if (class_split[0] == "color") {
                    color = class_split[1];
                }
            });
            return color;
        }
		$('#board').on('color', '.color', function (e) {
            e.preventDefault();
            
            var $box = $(this).closest('.box');
			var story_id = $(this).closest('li').attr('data-id');
            var color = getBoxColor($box);
            color = parseInt(color);
            $box.removeClass('color_' + color);
            $box.removeClass('panel-' + getColorName(color));
            
            color++;
            if (color >= possible_colors.length) {
                color = 0;
            }
            $box.addClass('color_' + color);
            $box.addClass('panel-' + getColorName(color));
		});

		$('#board').on('submit', 'form', function (e) {
            e.preventDefault();
			var $this = $(this);
            var story_id = $this.closest('li').attr('data-id');
			var title = $this.find('.editBox').val();
			var state = $this.closest('.col_state').attr('id').replace('state_','');
			var content = $this.find('.card_content_textarea').val();
			var responsible = $this.find('.userBox').val();
            var color = getBoxColor($this);
            var story = newCardObject({
                id:story_id,
                title:title,
                content:content,
                responsible:responsible,
                state:state,
                color:parseInt(color),
            });

			app_data.rawData[story_id] = story;
			saveData(app_data.rawData);
			$this.replaceWith(createStoryCard(story));

			IN_EDIT_MODE = false;
		});

		$('#board').on('save', '.save', function (e) {
            e.preventDefault();
			$(this).closest('form').submit();
		});

	});

})();