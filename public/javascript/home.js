let sharedData = null;
let users = [];
let issues = [];
let getSharedDataInterval = null;
let attached = false;
let tribute = null;
let getMessagesInterval = null;
let messageStore = [];
let current_selected = 'GLOBAL';
$(document).ready(function () {
    GetSharedData();

    $('.send-message-btn').on('click', function () {
        let message = $('.message-text').text();
        let author = $('.chat-container').attr('data-author');
        let time = moment().format();
        let recipient = $('.chat-dialog').attr('data-recipient');
        PostMessage(message, time, author, true);
        SendMessage(author, recipient, message, time);
        $(".message-text").text('');
        $(".message-text").focus();
    });
    FetchConversationData();

    $(document).on('click','.person-row',function () {
        $('.person-row').removeClass('selected');
        $(this).addClass('selected');
        let user = $(this).find('.person').text();
        current_selected = user;
        $('.chat-dialog').attr('data-recipient',user);

        RefreshMessagesDialog();
        UpdateInterfaceMessages();
    });
});

function UpdateInterfaceMessages() {
    //check if we need to update current dialog
    let current_recipient = $('.chat-dialog').attr('data-recipient');
    if(current_recipient =='GLOBAL') {
        current_recipient = '*';
    }
    let current_author = $('.chat-container').attr('data-author');
    for (let msgIter = 0; msgIter < messageStore.length; msgIter++) {
        messageStore[msgIter].sender = messageStore[msgIter].sender.replace(':','');

        if(current_recipient == '*') {
        if (messageStore[msgIter].recipient === current_recipient) {
            //public message
            let is_me = messageStore[msgIter].sender === $('.chat-container').attr('data-author');
            if (!CheckMessageExists(messageStore[msgIter].message, messageStore[msgIter].sender+':', messageStore[msgIter].time))
                PostMessage(messageStore[msgIter].message, messageStore[msgIter].time, messageStore[msgIter].sender, is_me);
        }
        }
        else {
         if((current_recipient == messageStore[msgIter].recipient && current_author == messageStore[msgIter].sender) ||
            (current_author == messageStore[msgIter].recipient && current_recipient == messageStore[msgIter].sender))
        {
            //private message
            let is_me = messageStore[msgIter].sender === $('.chat-container').attr('data-author');
            if (!CheckMessageExists(messageStore[msgIter].message, messageStore[msgIter].sender, messageStore[msgIter].time))
                PostMessage(messageStore[msgIter].message, messageStore[msgIter].time, messageStore[msgIter].sender, is_me);
        }
        }
    }


    //update for other contacts if we have new messages
}

//this function will be called when a user click on a user to chat
function FetchConversationData() {
    $.ajax({
        url: 'http://localhost:3003/getmessages',
        type: 'POST',
        dataType: 'json',
        success(response) {
            if (response.status === true) {
                messageStore = response.content;
                UpdateInterfaceMessages();
            }
            setTimeout(FetchConversationData, 1000);
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        },
    });
}

function CheckMessageExists(message, author, time) {
    let result = false;
    $('.conversation-section .message-row').each(function () {
        if ($(this).find('.message-content').text() === message &&
            $(this).find('.message-author').text() === author &&
            $(this).find('.message-time').text() === moment(time).format("ddd, h:mm:ss A")
        ) {
            result = true;

        }
    });
    return result;
}

function PostMessage(message, time, authorName, isMe) {
    let $message_row = $('<div/>', {
        class: 'message-row'
    });
    let $content = $('<div/>', {
        class: "message-content",
        text: message,
    });

    let $author = $('<div/>', {
        class: "message-author",
        text: authorName+':',
    });
    let $time = $('<div/>', {
        class: "message-time",
        text: moment(time).format("ddd, h:mm:ss A"),
    });
    if (isMe) {
        $($author).addClass('me');
    }

    $($message_row).append($author, $content, $time);
    $('.conversation-section').append($message_row);
}

function RefreshMessagesDialog(){
    $('.chat-dialog').find('.message-row').remove();
}
function SendMessage(sender, recipient, message, time) {
    $.ajax({
        url: 'http://localhost:3003/sendmessage',
        type: 'POST',
        data: {sender: sender, recipient: recipient, message: message, time: time},
        dataType: 'json',
        success(response) {
            if (response.status === true) {
                console.log('successfully pushed the repo');
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

//This function will be called periodically to update the data
function UpdateConversationsData() {

}

function InitializeMentions(users, issues, commits) {
    users = ['local','remote'];

    if (tribute === null) {
        tribute = new Tribute({
            collection: [{
                trigger: '@',
                selectClass: 'highlight',
                containerClass: 'tribute-container',
                itemClass: '',
                // function called on select that returns the content to insert
                selectTemplate: function (item) {
                    return "<a href='" + item.original.email + "'>" + item.string + "</a>";
                },
                // template for displaying item in menu
                menuItemTemplate: function (item) {
                    return '@' + item.original.name;

                },
                // template for when no match is found (optional),
                // If no template is provided, menu is hidden.
                noMatchTemplate: null,

                // specify an alternative parent container for the menu
                // container must be a positioned element for the menu to appear correctly ie. `position: relative;`
                // default container is the body
                menuContainer: document.body,
                lookup: 'name',
                fillAttr: 'email',

                // REQUIRED: array of objects to match
                values: users,

                // specify whether a space is required before the trigger string
                requireLeadingSpace: true,

                // specify whether a space is allowed in the middle of mentions
                allowSpaces: false,

                // optionally specify a custom suffix for the replace text
                // (defaults to empty space if undefined)
                replaceTextSuffix: '\n',

                // specify whether the menu should be positioned.  Set to false and use in conjuction with menuContainer to create an inline menu
                // (defaults to true)
                positionMenu: true,

                // when the spacebar is hit, select the current match
                spaceSelectsMatch: false,

                // turn tribute into an autocomplete
                autocompleteMode: false,

                // Customize the elements used to wrap matched strings within the results list
                // defaults to <span></span> if undefined
                searchOpts: {
                    pre: '<span>',
                    post: '</span>',
                    skip: false // true will skip local search, useful if doing server-side search
                },

                // specify the minimum number of characters that must be typed before menu appears
                menuShowMinLength: 0
            },
                {
                    trigger: '#',
                    selectClass: 'highlight',
                    containerClass: 'tribute-container',
                    itemClass: '',
                    // function called on select that returns the content to insert
                    selectTemplate: function (item) {
                        //TODO
                        return "<a href='" + item.original.email + "'>" + item.string + "</a>";
                    },
                    // template for displaying item in menu
                    menuItemTemplate: function (item) {
                        //TODO

                        return '@' + item.original.name;

                    },
                    // template for when no match is found (optional),
                    // If no template is provided, menu is hidden.
                    noMatchTemplate: null,

                    // specify an alternative parent container for the menu
                    // container must be a positioned element for the menu to appear correctly ie. `position: relative;`
                    // default container is the body
                    menuContainer: document.body,
                    lookup: 'name',
                    fillAttr: 'email',

                    // REQUIRED: array of objects to match
                    values: issues,

                    // specify whether a space is required before the trigger string
                    requireLeadingSpace: true,

                    // specify whether a space is allowed in the middle of mentions
                    allowSpaces: false,

                    // optionally specify a custom suffix for the replace text
                    // (defaults to empty space if undefined)
                    replaceTextSuffix: '\n',

                    // specify whether the menu should be positioned.  Set to false and use in conjuction with menuContainer to create an inline menu
                    // (defaults to true)
                    positionMenu: true,

                    // when the spacebar is hit, select the current match
                    spaceSelectsMatch: false,

                    // turn tribute into an autocomplete
                    autocompleteMode: false,

                    // Customize the elements used to wrap matched strings within the results list
                    // defaults to <span></span> if undefined
                    searchOpts: {
                        pre: '<span>',
                        post: '</span>',
                        skip: false // true will skip local search, useful if doing server-side search
                    },

                    // specify the minimum number of characters that must be typed before menu appears
                    menuShowMinLength: 0
                }]
        });

        tribute.attach(document.querySelectorAll(".message-text"));
    } else {
        // tribute.append(0, users);
        // tribute.append(1, issues);
    }

}

function UpdateContacts() {
    $('.contacts-dialog .person-row').remove();
    let $person_row = $('<div/>', {
        class: 'person-row'
    });
    if(current_selected =='GLOBAL') {
        $($person_row).addClass('selected');
    }
    let $name = $('<div/>', {
        class: 'person',
        text: 'GLOBAL'

    });
    let $no_of_msg = $('<span/>', {
        class: 'no-of-messages badge badge-danger'
    });
    $($person_row).append($name, $no_of_msg);

    $('.contacts-dialog').append($person_row);
    $('.contacts-dialog').append($person_row);
    for (let iter = 0; iter < users.length; iter++) {
        let $person_row = $('<div/>', {
            class: 'person-row'
        });
        if(current_selected == users[iter].name) {
            $($person_row).addClass('selected');
        }        let $name = $('<div/>', {
            class: 'person',
            text: users[iter].name

        });
        let $no_of_msg = $('<span/>', {
            class: 'no-of-messages badge badge-danger'
        });
        $($person_row).append($name, $no_of_msg);
        $('.contacts-dialog').append($person_row);
    }
}

function GetSharedData() {
    $.ajax({
        url: 'http://localhost:3003/get-shared-data',
        type: 'POST',
        dataType: 'json',
        success(response) {
            if (response.status === true) {
                users = response.content[3].data || [];
                let issues = response.content[1].data || [];
                let commits = response.content[2].data || [];
                InitializeMentions(users, issues, commits);
                UpdateContacts();
                setTimeout(function () {
                    GetSharedData();
                }, 3000);

            }

        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);

        }
    });
}
