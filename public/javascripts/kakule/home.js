if (!kakule.home) {
  kakule.home = {};
}

kakule.home.init = {
	init : function(){
		if ($("body#home")){
			//kakule.home.init.getLocation();
			kakule.home.init.attachSearchHandlers();
			kakule.home.init.attachEditHandlers();
			kakule.home.init.attachAddHandlers();
			kakule.home.init.attachShowHandlers();
      kakule.home.init.attachItineraryHandlers();
      kakule.home.init.calendars();
			kakule.home.init.session();
	  }
	},
	getLocation : function() {
      if (kakule.util.hasCachedLocationData()) {
        kakule.home.ui.setLocation(kakule.current.location);
        return;
      }

      //console.log("Location not cached, using geolocation");
	  if (Modernizr.geolocation) {
	    navigator.geolocation.getCurrentPosition(kakule.util.lookupLocationName);
	  } else {
	    // no native support; maybe try Gears?
	  }
	},
	
    attachShowHandlers : function() {
        $("body").delegate(".show-more", "click", function() {
            var split = $(this).attr("id").split("-");
            var description = $("#description-" + split[1]);
            var hide = $("#less-" + split[1]);

            $(this).hide();
            description.slideDown(100);
            hide.show();
        });

        $("body").delegate(".show-less", "click", function() {
            var split = $(this).attr("id").split("-");
            var description = $("#description-" + split[1]);
            var show = $("#more-" + split[1]);

            $(this).hide();
            description.slideUp(100);
            show.show();
        });
        
    }, 

	attachAddHandlers : function() {
		$("body").delegate(".add-event", "click", function(e) {
            e.preventDefault();
            var elem = $(this);
            var parent = elem.parent();
            var split = elem.attr("id").split("-");
            var type = split[1];
            var id = parseInt(split[2]);

            $.post("/itineraries/add_event/",
                {type: type, id: id, from: kakule.current.date}, 
                function(data) {
                    $("#empty").remove();
                    common = function() {
                        $(".empty-itinerary").remove();
                        // Remove current object
                        $("#event-" + id).fadeOut();
                    }
                    if (type == "event") {
                        var callback = function() {
                            common();
                            var event = data.obj.event;
                            kakule.home.ui.addEventToItinerary(event);
                        }
                    } else if (type == "attraction") {
                        var callback = function() {
                            common();
                            var attraction = data.obj.attraction;
                            kakule.home.ui.addAttractionToItinerary(attraction);
                        }
                    } else if (type == "meal") {
                        var callback = function() {
                            common();
                            var meal = data.obj.attraction;
                            kakule.home.ui.addMealToItinerary(meal);
                        }
                    }

                    $("#itinerary-day").append($("<div></div>").addClass("empty-itinerary"));
                    parent.effect("transfer", {to: ".empty-itinerary", className: "ui-effects-transfer"}, 250, callback);
                    
                }
            );
		});
	},

    attachEditHandlers : function() {
        $("#itinerary-name").click(function() {
            $("#itinerary-name").removeClass("itinerary-name-icon");
        });
        $("#itinerary-name").editInPlace({
            callback: function(unused, enteredText) { 
                $.post('/itineraries/edit_name', 
                       { update_value: enteredText }
                      );

                $("#itinerary-name").addClass("itinerary-name-icon");
                return enteredText;
            },
            save_if_nothing_changed: true,
		    show_buttons: false 
	    });
    },

	attachSearchHandlers : function(){
        $("#location-search").autocomplete("/search/places", {
            dataType: 'json',
            scroll: false,
            formatItem: function(item) {
                    return item.name;
            },
            parse: function(data) {
                    var array = new Array();
                    for(var i = 0; i < data.length; i++) {
                            array[array.length] = { data: data[i], value: data[i]};
                    }
                    return array;
            },
            highlight: function(value, term) { 
                return value.replace(new RegExp("("+term+")", "gi"),'<span class="ac_highlight">$1</span>'); 
            },
						delay: 200,
            }).result(function(event, item) {
                kakule.current.lat = item.lat;
                kakule.current.lng = item.lng;
                $("#location-search").val(item.name);
                $.get("/search/questions",
                      {id: item.id, type: item.type},
                      function(data) {
                        $("#content").empty();
                        $("#content").append(data.html);

                        // Preload images
                        photos = data.photos
                        for (var i = 0; i < photos.length; i++) {
                            var image = new Image();
                            image.src = photos[i];
                        }

                        kakule.home.search.attractions("");
                        kakule.home.search.meals("");
                        kakule.home.init.attachPhotoGalleryHandlers();
                      });
            });
	},

    attachItineraryHandlers : function() {
        $("#itinerary-events").sortable();
    },

    attachPhotoGalleryHandlers : function() {
        $("#thumbs").delegate(".place-photo-img", "click", function() {
            // Save thumbnail information
            var photo_url = $(this).attr("id");
            var thumb_url = $(this).attr("src");

            // Replace the thumbnail
            $(this).attr("id", $(".main-photo-img").attr("src"));
            $(this).attr("src", $(".main-photo-img").attr("id"));

            // Replace the main photo
            $(".main-photo-img").attr("id", thumb_url);
            $(".main-photo-img").attr("src", photo_url);
        });
    },

  calendars : function() {
    $.each($(".itinerary"), function(i, item) {
      var id = $(item).attr("id");
      var visStartDate = new Date($("#start-date-" + id).html());
      var visEndDate = new Date($("#end-date-" + id).html());

      $("#calendar-" + id).fullCalendar({
        visStartDate: visStartDate,
        visEndDate: visEndDate,
        weekMode: "variable",
        events: "/itineraries/" + id + "/timeline"
      });
      
    });
  },

	session : function(){
		var sessionDiv = $("#session");
		var loginLink = $(".login", sessionDiv);
		loginLink.click(function(){
			$(".popup", sessionDiv).toggle(200);
		});
	}
};

kakule.home.search = {
	attractions : function(query){
		function callback (response){
            kakule.home.ui.repopulateAttractions(response);
		};
		kakule.server.searchAttractions({'query': query, 'lat': kakule.current.lat, 'lng': kakule.current.lng}, callback);
	},
	
	meals : function(query){
		function callback (response){
            kakule.home.ui.repopulateMeals(response);
		};
		kakule.server.searchMeals({'query': query, 'lat': kakule.current.lat, 'lng': kakule.current.lng}, callback);
	},

	locations : function(query){
		function callback (response){
            kakule.home.ui.repopulateLocations(response);
						var geocode_data = {};
						$.each(response.data, function(i, entry){
							geocode_data[entry.geocode.id] = entry.geocode;
						});
					  kakule.current.geocode_data = geocode_data;	
		};
		kakule.server.searchLocations({'query' : query}, callback);
	}
};


kakule.home.ui = {
  repopulateAttractions : function(data) {
     var resultsDiv = $("#attractions");
     resultsDiv.empty();
     resultsDiv.append(data.html);
  },

  repopulateMeals : function(data) {
    var resultsDiv = $("#meals");
    resultsDiv.empty();
    resultsDiv.append(data.html);
  },

  addEventToItinerary : function(event) {
    $("#itinerary-events").append(
        $("<li></li>")
            .addClass("itinerary-event")
            .append(
                $("<div></div>")
                    .addClass("event-thumbnail")
                    .append(
                        $("<img>")
                            .attr("src", event.photo_url)))
            .append(
                $("<div></div>")
                    .addClass("event-information")
                    .append(
                        $("<span></span>")
                            .addClass("name")
                            .text(event.name))
                    .append(
                        $("<span></span>")
                            .addClass("time")
                            .text("12:00am - 11:59pm")))
             .append(
                $("<div></div>")
                    .addClass("clear")));

    // Flash notice
    $("#added").show().delay(3000).fadeOut(500);
  },

  addAttractionToItinerary : function(attr) {
    $("#itinerary-events").append(
        $("<li></li>")
            .addClass("itinerary-event")
            .append(
                $("<div></div>")
                    .addClass("event-thumbnail")
                    .append(
                        $("<img>")
                            .attr("src", attr.photo_url)))
            .append(
                $("<div></div>")
                    .addClass("event-information")
                    .append(
                        $("<span></span>")
                            .addClass("name")
                            .text(attr.name))
                    .append(
                        $("<span></span>")
                            .addClass("time")
                            .text("12:00am - 11:59pm")))
             .append(
                $("<div></div>")
                    .addClass("clear")));

    // Flash notice
    $("#added").show().delay(3000).fadeOut(500);
  },

  addMealToItinerary : function(meal) {
    $("#itinerary-events").append(
        $("<li></li>")
            .addClass("itinerary-event")
            .append(
                $("<div></div>")
                    .addClass("event-thumbnail")
                    .append(
                        $("<img>")
                            .attr("src", meal.photo_url)))
            .append(
                $("<div></div>")
                    .addClass("event-information")
                    .append(
                        $("<span></span>")
                            .addClass("name")
                            .text(meal.name))
                    .append(
                        $("<span></span>")
                            .addClass("time")
                            .text("12:00am - 11:59pm")))
             .append(
                $("<div></div>")
                    .addClass("clear")));

    // Flash notice
    $("#added").show().delay(3000).fadeOut(500);
  },

  setLocation : function(location) {
    $("#current_location").text(location);
  },
};



