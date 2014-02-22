if (Meteor.isClient) {

  Template.movieList.rate = function (e) {
    if (e) {
      return String((e / 100) * 5);
     }
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
