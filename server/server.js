//Return only the messages that are associated with the current hash.
Meteor.publish("Messages", function(user_hash) {
  return Messages.find({hash: user_hash}, {sort: {time: -1},limit: 30});
});
