/**
 * Javascript functions to show bottom nitification
 * Error/Success/Info/Warning messages
 * Developed By: Ravi Tamada
 * url: http://androidhive.info
 * © androidhive.info
 * 
 * Created On: 10/4/2011
 * version 1.0
 * 
 * Usage: call this function with params 
 showNotification(params);
 **/

function showNotification(params){
    // Extending array from params
    var options = $.extend({ 
        'showAfter': 0, // number of sec to wait after page loads
        'duration': 0, // display duration
        'autoClose' : false, // flag to autoClose notification message
        'type' : 'success', // type of info message error/success/info/warning
        'message': '', // message to dispaly
        'link_notification' : '', // link flag to show extra description
        'description' : '', // link to desciption to display on clicking link message
        'appendTo' : 'body' // link to desciption to display on clicking link message
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
    var container = '<div class="info_message '+msgclass+'"><div class="center_auto"><div class="info_message_text message_area">';
    container += options['message'];
    container += '</div><div class="info_close_btn button_area"></div><div class="clearboth"></div>';
    container += '</div><div class="info_more_descrption"></div></div>';
    
    $notification = $(container);
    
    // Appeding notification to Body
    $(options.appendTo).append($notification);
    
   


    // function to close notification message
    // slideUp the message
    var closeNotification = function(){
            setTimeout(function(){
                $('.info_message').animate({
                    height: "toggle"
                },400,function(){
                    $('.info_message').remove();
                });
            }, parseInt(options['duration'] * 1000));   
    }

    // sliding down the notification
    var slideDownNotification = function(showAfter, autoClose, duration){    
        setTimeout(function(){
            // showing notification message, default it will be hidden
            $('.info_message').show(400,function(){
                if(autoClose){
                    setTimeout(function(){
                        closeNotification();
                    }, duration);
                }
            });
        }, parseInt(showAfter * 1000));    
    }

    // Slide Down notification message after startAfter seconds
    slideDownNotification(options['showAfter'], options['autoClose'],options['duration']);

    $(options.appendTo).on('click','.link_notification',function(e){
        e.preventDefault();
        $('.info_more_descrption').html(options['description']).slideDown('fast');
    });

    $(options.appendTo).on('click','.info_close_btn',function(e){
        e.preventDefault();
        closeNotification();
    });
}





