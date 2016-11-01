var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8,
	zoomControl: false,
	scaleControl: false,
	mapTypeControl: false
        });

    // This event listener will call addMarker() when the map is clicked.
    map.addListener('click', function(event) {
        fakepos(event.latLng);
    });
}

var auto_update = true;

function fakepos (pos) {
    auto_update = !(auto_update);
    if (auto_update) {
	navigator.geolocation.getCurrentPosition(watch);
	return;
    }

    //console.log(pos);
    var p = { "latitude": pos.lat(), "longitude": pos.lng(), "altitude": "0" };
    
    updateMyMarker(pos);
    console.log("fake : "+p);
    sendUpdate(p);
}

function updateMyMarker (pos) {
    if (my_marker != null)
	my_marker.setMap(null);
    var p = { lat: pos.lat(), lng: pos.lng() }
    my_marker = new google.maps.Marker({
        position: p,
	title: "bla"
    });
    my_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
    my_marker.setMap(map);
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {

};

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
};

function watch(pos) {
    if (bounds == null) {
	console.log("init bounds");

    }
    console.log(auto_update);
    if (!auto_update)
	return 

    var crd = pos.coords;
    sendUpdate(crd);

    var center = new google.maps.LatLng(crd.latitude, crd.longitude);
    //google.maps.event.trigger(map, "resize"); 
    //map.setCenter(center);
    
    if (!(my_marker == null))
	my_marker.setMap (null);
    my_marker = new google.maps.Marker({
	position: center,
	title:"Hello World!"
    });
    my_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
    my_marker.setMap(map);


}

function recenter () {
    bounds = new google.maps.LatLngBounds();
    if (bounds == null || my_marker == null)
	return;
    
    // add my marker
    bounds.extend     ( new google.maps.LatLng(my_marker.position.lat(), my_marker.position.lng()));

    // add others
    for (o in others) {
	//alert("adding one other");
	bounds.extend ( new google.maps.LatLng(others[o].position.lat(), others[o].position.lng() ));
    }

    map.fitBounds(bounds);       //# auto-zoom
    map.panToBounds(bounds);     //# auto-center
}

function updateScreen () {
    console.log ("updating screen");
    getOthers(map);
}

function watch_error (err) {
    console.log ("Error: "+err);
}

function enableNoSleep() {
    noSleep.enable();
    document.removeEventListener('touchstart', enableNoSleep, false);
    document.getElementById('button').value="No Sleep!";
}

var noSleep = new NoSleep();
var bounds = null ;// = new google.maps.LatLngBounds();

document.removeEventListener('touchstart', enableNoSleep, false);


var others = [];
var my_marker = null;

//navigator.geolocation.getCurrentPosition(success, error, options);
var options = {timeout:4000};
navigator.geolocation.watchPosition( watch, watch_error, options);

setInterval('updateScreen();', 5000);
