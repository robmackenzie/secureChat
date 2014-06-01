Session.setDefault("my_name", "Anonymous");
Session.setDefault("cifer_key","Secret");

var hasFocus = true; //On load, probably has focus, and they haven't logged in anyhow.
$(window).focus(function() {
    hasFocus=true;
    reset_notifications();
});
$(window).blur(function() {
    hasFocus=false;
});

var notification_sound = new Audio('not.mp3');
notification_sound.volume=.1
jQuery.timeago.settings.allowFuture = true;


Deps.autorun(function () {
    Meteor.subscribe("Messages",sjcl.hash.sha256.hash(Session.get("cifer_key")));
})

Meteor.startup(function () {
  $('#messageInput').focus();
  $('#modal-login').modal('show');
});

Template.messageblock.get_messages = function () {
  return Messages.find({hash : sjcl.hash.sha256.hash(Session.get("cifer_key"))}, {sort: {time: -1},limit: 30}); //TODO: Look into this sub/pub, see where limits make sense.
};
Template.message.get_human_date = function () {
  return Date(this.time).toString();
};
Template.message.is_owner = function () {
  return Session.equals("my_name", this['name']);
};

Template.message.decrypt_message = function () {
  return sjcl.decrypt(Session.get("cifer_key"),this.message);
};

Template.message.rendered = function () {
    notify();
    var thisMessage = $(this.firstNode)
    thisMessage.find(".timeago").timeago();
    thisMessage.find(".message_text").html(convertToLinks(thisMessage.find(".message_text").html()))
    
};

function convertToLinks(text) {
var replaceText, replacePattern1;

//URLs starting with http://, https://
replacePattern1 = /(\b(https?):\/\/[-A-Z0-9+&amp;@#\/%?=~_|!:,.;]*[-A-Z0-9+&amp;@#\/%=~_|])/gi;
replacedText = text.replace(replacePattern1, '<a title="$1" href="$1" target="_blank">$1</a>');

//URLs starting with "www."
replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gi;
replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

//Bold text between markers
replacePattern3 = /(?!\*{3,})\*\*\.\.(.+?)\*\*/gi;
replacedText = replacedText.replace(replacePattern3, '<strong style="font-size:200%">$1</strong>');


//Bold text between markers
replacePattern4 = /(?!\*{3,})\*\*(.+?)\*\*/gi;
replacedText = replacedText.replace(replacePattern4, '<strong>$1</strong>');


//returns the text result
return replacedText;
}



Template.dataentry.events = {
    'submit form' : function (event) {
      event.preventDefault();
      postMessage();
    }
}

Template.login_modal.events = {
  "keydown #my_name": function (event) {
    if (event.which == 13) {
      set_login_data();
    }
  },
  "keydown #cifer_key": function (event) {
    if (event.which == 13) {
      set_login_data();
    }
  },
  "click #login_submit": function (event) {
     set_login_data();
  }
}

function postMessage() {
  // Submit the form
  var messageInput = document.getElementById('messageInput');
  if (messageInput.value != '') {
  Meteor.call("postMessage", {
    name: Session.get("my_name"),
    message: sjcl.encrypt(Session.get("cifer_key"),messageInput.value),
    hash: sjcl.hash.sha256.hash(Session.get("cifer_key"))})
  messageInput.value = ''; // Reset form
  }
  messageInput.focus();
};

function set_login_data() {
  if ($("#my_name").val() != "")
    Session.set("my_name",$("#my_name").val());
  if ($("#cifer_key").val() != "")
    Session.set("cifer_key",$("#cifer_key").val());
  $('#modal-login').modal('hide');
}

flashTitle="";
titleFlashing=false;
function notify() {
  if (!hasFocus) {
    notification_sound.play();
    if (notification_sound.volume < 1) {
      notification_sound.volume+=.2
    }
    if (!titleFlashing){
      flashTitle=window.setInterval(function() {document.title = document.title == "SecChat" ? "New Message - SecChat" : "SecChat";},1000); // TODO: generalize this function, less hardcoded values. maybe move flashtitle to just set interval here
      titleFlashing=true;
    }
  }
}
function reset_notifications() {
  notification_sound.volume=.1 //Reset volume
  clearInterval(flashTitle);
  titleFlashing=false;
  document.title = "SecChat";
}