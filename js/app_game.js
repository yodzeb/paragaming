var app = angular.module('game', [  'ngMap', 'Api', 'ui.router', 'ngMaterial']);
app.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
	    .state('game', {
		url: '/game/:gameid',
		templateUrl: 'g.html',
		controller: 'GameCtrl'
	    });	
	$urlRouterProvider.otherwise("game");
});

app.controller('GameCtrl',['$scope','NgMap','$interval','$stateParams','$state','$http','apiCtf',function($scope,NgMap,$interval,$stateParams,$state,$http,apiCtf){
    $scope.testvar=false;
    $scope.game = { 
	id : "no-game-id",
	autoupdate: false
    };

    if (!( $stateParams.gameid == undefined )) {
	console.log("loading params");
	$scope.game.id         =  $stateParams.gameid;
	$scope.game.autoupdate = true;
	$scope.game.others     = {};
    }
    
    // Global variables
    $scope.button     = { 
	nosleep : "NoSleep is OFF" ,
	mapwps  : "WPS/PLAYERS"
    };
    $scope.variable   = { 
	nosleep : false,
	displaymap: 0
    };
    var noSleep = new NoSleep();
    $scope.autoupdate = true;
    
    $scope.nick = { name: "" };
    $scope.map  = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    
    $scope.my_marker;
    $scope.my_marker_mapSet = false;
    
    $scope.updatePositionError = function (err) {

    }
    
    
    /***********
     *   UI 
     **********/
    $scope.enableNoSleep = function () {
	if ( $scope.variable.nosleep ){
	    noSleep.disable();
	    $scope.variable.nosleep = false;
	    $scope.button.nosleep = "NoSleep is OFF";
	}
	else {
	    $scope.variable.nosleep = true;
	    noSleep.enable();
	    $scope.button.nosleep = "NoSleep is ON";
	}
    }

    $scope.mapWPS = function () {
	$scope.variable.displaymap = ($scope.variable.displaymap+1)%3;
	if ($scope.variable.displaymap == 0) {
	    $scope.button.mapwps = "WPS/PLAYERS";
	    $scope.updateAll();	    
	}
	else if ($scope.variable.displaymap == 1) {
	    $scope.button.mapwps = "PLAYERS/MAP";
	}
	else {
	    $scope.button.mapwps = "MAP/WPS";
	}
    }
    
    /****************
     *   GAME CORE
     ****************/
    $scope.updatePosition = function (pos) {
	if ($scope.autoupdate) {
	    var crd = pos.coords;
	    apiCtf.sendUpdate(crd, $scope.game.id);
	    $scope.game.my_crd = crd;
	    $scope.updateAll();
	    //apiCtf.listGames($scope.game.id);
	}
    }

    $scope.getGameInfo = function () {
	apiCtf.getGameInfo($scope.game.id).then(function(res) {
	    $scope.game.info = res['data'];
	    var arr_wps = [];
	    for (w in $scope.game.info.wps) {
		$scope.game.info.wps[w].name = w;
		arr_wps.push($scope.game.info.wps[w]);
	    }
	    $scope.game.info.wps = arr_wps;
	    $scope.updateAll();
	});

    }

    $scope.getPlayers =function () {
	if ($scope.game.id == undefined ) 
	    return;

	$scope.getGameInfo();

	apiCtf.getOthers ($scope.game.id)
	    .then ( function (res) {
		var arr = [];
		console.log(res.data);
		for (o in res['data']) {
		    if (!($scope.game.others[o] == undefined)) {
			//update
			$scope.game.others[o]['lat'] = res['data'][o]['lat'];
			$scope.game.others[o]['lon'] = res['data'][o]['lon'];
			$scope.game.others[o]['alt'] = res['data'][o]['alt'];
			var center = new google.maps.LatLng($scope.game.others[o]['lat'], $scope.game.others[o]['lon']);
			$scope.game.others[o].marker.setPosition (center);
		    }
		    else {
			//create
			$scope.game.others[o] = res['data'][o];
			var center = new google.maps.LatLng($scope.game.others[o]['lat'], $scope.game.others[o]['lon']);
			var marker = new google.maps.Marker({
			    position: center,
			    title: "other"
			});
			$scope.game.others[o].mapSet = false;
			marker.setIcon('https://maps.google.com/mapfiles/ms/icons/orange-dot.png');
			$scope.game.others[o].marker = marker;
		    }
		}
		$scope.updateAll();
	    });
    }

    

    /****************
     * MAP UPDATES
     ****************/
    $scope.recenter = function (map) {
	var bounds = new google.maps.LatLngBounds();
	if ($scope.my_marker == null)
	    return;
	
	// add my marker
	bounds.extend     ( new google.maps.LatLng($scope.my_marker.position.lat(), $scope.my_marker.position.lng()));

	// add wps
	for (w in $scope.game.wps_markers) {
	    var wps = $scope.game.wps_markers[w];
	    bounds.extend     ( wps.getCenter() );
	}

	// add others
	for (o in $scope.game.others) {
	    var other = $scope.game.others[o].marker;
	    bounds.extend     (  new google.maps.LatLng(other.position.lat(), other.position.lng()));
	}

	map.fitBounds(bounds);       //# auto-zoom
	map.panToBounds(bounds);     //# auto-center
    }

    $scope.updateMe = function (map) {
	var crd = $scope.game.my_crd;
	if (crd == undefined) {
	    return;
	}
	var center = new google.maps.LatLng(crd.latitude, crd.longitude)
	if (!($scope.my_marker == null)) {
	    $scope.my_marker.setPosition (center);
	}
	else
	    $scope.my_marker = new google.maps.Marker({
		position: center,
		title:"Hello World!"
	    });
	if ($scope.autoupdate)
	    $scope.my_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
	else
	    $scope.my_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/red-dot.png');
	if (!$scope.my_marker_mapSet) {
	    $scope.my_marker.setMap(map);
	    $scope.my_marker_mapSet = true;
	}
    }

    $scope.updateOthers = function (map) {
	for (o in $scope.game.others) {
	    if (!( $scope.game.others[o].marker == undefined) && !$scope.game.others[o].mapSet) {
		$scope.game.others[o].marker.setMap(map);
		$scope.game.others[o].mapSet = true;
	    }
	}
    }

    $scope.updateWPS = function (map) {
	if ($scope.game.wps_markers == undefined) {
	    var arr = {};
	    for (w in $scope.game.info.wps) {
		var wps = $scope.game.info.wps[w];
		var wpsCircle = new google.maps.Circle({
		    strokeColor: '#FF0000',
		    strokeOpacity: 0.8,
		    strokeWeight: 2,
		    fillColor: '#FF0000',
		    clickable: false,
		    fillOpacity: 0.35,
		    map: map,
		    center: {lat: parseFloat(wps.lat), lng: parseFloat(wps.lon)},
		    radius: wps.radius
		});
		arr[wps.name]=wpsCircle;
	    }		
	    $scope.game.wps_markers = arr;
	}
	else {
	    for (w in $scope.game.info.wps) {
		var wps = $scope.game.info.wps[w];
		if (!(wps.taken == undefined) &&
		    wps.taken == 1) {
		    $scope.game.wps_markers[wps.name].setOptions({
			strokeColor: '#00FF00',
			fillColor  : '#00FF00'
		    });
		}
		else {
		    $scope.game.wps_markers[wps.name].setOptions({
			fillColor: '#FF0000',
			strokeColor: '#FF0000'
		    });
		}
		
	    }
	}
    }

    $scope.updateAll = function () {
	NgMap.getMap().then(function(map) {
	    $scope.updateOthers(map);
	    $scope.updateWPS(map);
	    $scope.updateMe(map);
	    $scope.recenter(map);
	});
    }


    $scope.fakepos = function ( pos ) {
	$scope.autoupdate = !($scope.autoupdate);
	if ($scope.autoupdate) {
	    navigator.geolocation.getCurrentPosition($scope.updatePosition);
	    return;
	}

	var p = { "latitude": pos.lat(), "longitude": pos.lng(), "altitude": "234" };

	$scope.game.my_crd = p;
	$scope.updateAll();

	apiCtf.sendUpdate(p, $scope.game.id);

    }


    /*************
     *   INIT
     ************/

    NgMap.getMap().then(function(map) {
	var opts = {
	    zoom: 8,
	    zoomControl: false,
	    scaleControl: false,
	    mapTypeControl: false,
	    streetViewControl: false,
	    mapTypeId: 'terrain'

	};
	map.setOptions(opts);
	console.log ("setttings changed");
	
	map.addListener('click', function(event) {
	    $scope.fakepos(event.latLng);
	});
    });

    /**
     * Initiate timed functions
     **/
    console.log (" Starting autoupdates");
    var options = {
	timeout:4000,
	enableHighAccuracy:true
    };
    navigator.geolocation.watchPosition( $scope.updatePosition, $scope.updatePositionError, options);
    $interval ( $scope.getPlayers, 5000 );
    $scope.getGameInfo();
    
}]);