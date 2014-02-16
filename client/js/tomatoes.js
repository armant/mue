suggestions = [];

window.fbAsyncInit = function() {
  FB.init({
    appId      : '260823654091909',
    status     : true,
    xfbml      : true
  })

FB.Event.subscribe('auth.authResponseChange', function(response) {

  // Here we specify what we do with the response anytime this event occurs. 
  if (response.status === 'connected') {
    var access_token = FB.getAuthResponse().accessToken;
    // 655408561182349 band event (37 friends)
    // 422785927854157 is truth real (10 friends)
    // 573088256109912 pennapps (5 friends)
    var q = 'SELECT movies FROM user WHERE uid IN (SELECT uid FROM event_member WHERE eid="422785927854157" AND rsvp_status="attending") AND uid IN (SELECT uid2 FROM friend where uid1 = me())'
		$.ajax({
			url: 'https://graph.facebook.com/fql/?q=' + q + '&access_token=' + access_token
		}).done(function(data) {
			movies = data.data;
			var rendered_html = '';
			for (var i = 0; i < movies.length; i++) {
				if (movies[i].movies != "") {
					rendered_html += movies[i].movies;
					if (i + 1 < movies.length) {
						rendered_html += ", ";
						}
					}
			}
			rendered_html = rendered_html.toLowerCase();
			var arr = rendered_html.split(", ").sort();
			var ranked = {};
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] in ranked) {
					ranked[arr[i]] += 1;
				}
				else {
					ranked[arr[i]] = 1;
				}
			}
			function sortObject(obj) {
					var arr = [];
					for (var prop in obj) {
							if (obj.hasOwnProperty(prop)) {
							    arr.push({
							        'key': prop,
							        'value': obj[prop]
							    });
							}
					}
					arr.sort(function(a, b) { return a.value - b.value; });
					return arr; // returns array
			}
			var sorted = sortObject(ranked);
			
			// $('#doit').click(suggest);			
			
			var apikey = "dmd24njd74fs8tr99xh7kkme";
			var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";

			//for (var i=sorted.length; i > sorted.length - 10; i -= 2) {
			for (var i=sorted.length-1; i > sorted.length - 13; i-=2) {
				var weight = sorted[i].value;
				var query = sorted[i].key;
				var movie_name = query;
				var moviesSearchUrl = baseUrl + '/movies.json?apikey=' + apikey;
				$.ajax({
					url: moviesSearchUrl + '&q=' + encodeURI(query),
					dataType: "jsonp",
					success: findSuggestions
				});
			}

			function findSuggestions(data) {
			if (data.movies[0]){
			var movie_id = data.movies[0].id;
			//console.log(movie_name);
			var moviesSuggestUrl = baseUrl + '/movies/' + movie_id + '/similar.json?apikey=' + apikey;
				// send off the query
				$.ajax({
					url: moviesSuggestUrl,
					dataType: "jsonp",
					success: searchCallback
				});
				}
			}

			function searchCallback(data) {
			 var movies = data.movies;
			 $.each(movies, function(index, movie) {
				 //$(document.body).append('<img src="' + movie.posters.thumbnail + '" />');
				 suggestions.push(movie);
				 $('.modal-body').html(Meteor.render(Template.movieList));
				 $('span.stars').stars();
			 });
			}

			//console.log(suggestions);

			//$('#movies').html(ranked.toString());
			//$('#movies').html(arr.toString());
			})
    // The response object is returned with a status field that lets the app know the current
    // login status of the person. In this case, we're handling the situation where they 
    // have logged in to the app.
  } else if (response.status === 'not_authorized') {
    // In this case, the person is logged into Facebook, but not into the app, so we call
    // FB.login() to prompt them to do so. 
    // In real-life usage, you wouldn't want to immediately prompt someone to login 
    // like this, for two reasons:
    // (1) JavaScript created popup windows are blocked by most browsers unless they 
    // result from direct interaction from people using the app (such as a mouse click)
    // (2) it is a bad experience to be continually prompted to login upon page load.
    FB.login();
  } else {
    // In this case, the person is not logged into Facebook, so we call the login() 
    // function to prompt them to do so. Note that at this stage there is no indication
    // of whether they are logged into the app. If they aren't then they'll see the Login
    // dialog right after they log in to Facebook. 
    // The same caveats as above apply to the FB.login() call here. 
    FB.login();
  }
});

};

Template.movieList.movies = function () {
  return suggestions;
};

Template.movieList.rate = function (e) {
  console.log(e);
  //console.log(e.ratings);
  if (e) {
    return String((e / 100) * 5);
   }
  //(this.ratings.critics_score / 100) * 5
}

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/all.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
