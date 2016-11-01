var api_url="/cgi-bin/api.pl";



function getOthers (map) {
    var data = {
	"cmd" : "others"
    }
    xhr = new XMLHttpRequest();
    var url = api_url;

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
	    for (o in others) {
		console.log("remove");
		others[o].setMap(null);
	    }
	    
	    others = [];
	    var res = JSON.parse(xhr.responseText);

	    for (r in res) {
		var pos = { lat: parseFloat(res[r]["lat"]), lng: parseFloat(res[r]["lon"])};
		//console.log(pos);
		var o_marker = new google.maps.Marker({
		    position: pos,
		    title   : r
		});
		o_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/blue-dot.png');
		o_marker.setMap(map);
		others.push(o_marker);
		var loc = new google.maps.LatLng(o_marker.position.lat(), o_marker.position.lng());
		bounds.extend(loc);
	    }

        }
	recenter();
    }
    var data = JSON.stringify(data);
    xhr.send(data);
}


function sendUpdate(crd, game) {
    var data = {
	"cmd" : "up",
	"c"   : {
	    "lat": crd.latitude,
	    "lon": crd.longitude,
	    "alt": crd.altitude
	},
	"gid" : game.id
    }

    xhr = new XMLHttpRequest();
    var url = api_url;

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () { 
	if (xhr.readyState == 4 && xhr.status == 200) {
            //var json = JSON.parse(xhr.responseText);
	    
	}
    }
    var data = JSON.stringify(data);
    xhr.send(data);
}