// All messages -- data model
// Loaded on both the client and the server

///////////////////////////////////////////////////////////////////////////////
// Messages

/*
  Each message is represented by a row in the Messages collection:
    name: Name of poster, not verified in any way
    hash: A hash of the cifer used to encrypt the message, using sha256
    time: ISO format timestamp of when the message was sent.
    message: AES encrypted string that contains the message.
*/
Messages = new Meteor.Collection("messages");

Messages.allow({
  insert: function () {
    return false; // Everything through methods now.
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});

Meteor.methods({
  postMessage: function (messageHashTable){
      Messages.insert({
        name: messageHashTable['name'],
        message: messageHashTable['message'],
        hash: messageHashTable['hash'],
        time: ((new Date()).toISOString())
      });
    }
});