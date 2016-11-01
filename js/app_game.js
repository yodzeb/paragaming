angular.module('game', [ 'ionic', 'ngMap', 'Api'])

    .config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	    .state('game', {
		url: '/game/:gameid',
		templateUrl: 'g.html',
		controller: 'GameCtrl'
	    });	
	$urlRouterProvider.otherwise("game");
    })

    .controller('GameCtrl',['$scope','NgMap','$interval','$stateParams','$state','$http','apiCtf',function($scope,NgMap,$interval,$stateParams,$state,$http,apiCtf){
	$scope.game = { 
	    id : "no-game-id",
	    autoupdate: false
	};
	
	if (!( $stateParams.gameid == undefined )) {
	    $scope.game.id         =  $stateParams.gameid;
	    $scope.game.autoupdate = true;
	}
	
	// view
	$scope.button = { nosleep : "Disable Auto Sleep" };

	$scope.autoupdate = true;
	
	$scope.nick = { name: "" };
	$scope.map  = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
	
	$scope.my_marker;
	
	$scope.reinit  = function () {
	    
	}
	
	$scope.updatePosition = function (pos) {
	    if (!$scope.autoupdate) {
		console.log ("auto update disabled");
		return;
	    }
	    console.log ("Position update!")
	    console.log(pos);
	    var crd = pos.coords;
	    sendUpdate(crd, $scope.game);

	    $scope.game.my_crd = crd;

	    $scope.updateWPS();
	    // NgMap.getMap().then(function(map) {

	    // });
	}
	
	$scope.recenter = function (map) {
	    
	    var bounds = new google.maps.LatLngBounds();
	    if ($scope.my_marker == null)
		return;
	    
	    // add my marker
	    bounds.extend     ( new google.maps.LatLng($scope.my_marker.position.lat(), $scope.my_marker.position.lng()));
	    for (w in $scope.game.wps_markers) {
		var wps = $scope.game.wps_markers[w];
		bounds.extend     ( wps.center );
	    }
	    map.fitBounds(bounds);       //# auto-zoom
	    map.panToBounds(bounds);     //# auto-center
	}

	$scope.updatePositionError = function (err) {
	    //console.log (err);
	}
	
	$scope.getPlayers =function () {
	    //console.log ("update!");
	}

	
	$scope.enableNoSleep = function () {
	    noSleep.enable();
	    document.removeEventListener('touchstart', enableNoSleep, false);
	    $scope.button.nosleep = "No Sleep Activated!";
	    //document.getElementById('button').value="No Sleep!";
	}

	
	$scope.getGameInfo = function (gameid) {
	    apiCtf.getGameInfo($scope.game.id).then(function(res) {
		console.log(res);
		$scope.game.info = res['data'];
		$scope.updateWPS();
	    });
		// .then(function successCallback(response) {
            //     //$scope.status.push("Game created");
	    // 	console.log(response);
            // }, function errorCallback(response) {
            //     //$scope.status.push("Error");
            // });

	}

	$scope.updateWPS = function () {

	    NgMap.getMap().then(function(map) {
		if ($scope.game.wps_markers == undefined) {
		    var arr = [];
		    for (w in $scope.game.info.wps) {
			var wps = $scope.game.info.wps[w];
			console.log(wps);
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
		    arr.push (wpsCircle);
		    }		
		    $scope.game.wps_markers = arr;
		}

		var crd = $scope.game.my_crd;
		if (crd == undefined) {
		    console.log ("no my marker");
		    return;
		}
		var center = new google.maps.LatLng(crd.latitude, crd.longitude)
		if (!($scope.my_marker == null)) {
		    console.log ("updating my marker");
		    console.log (center);
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
		$scope.my_marker.setMap(map);
		$scope.recenter(map);

	    });
	}

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

	$scope.fakepos = function ( pos ) {
	    $scope.autoupdate = !($scope.autoupdate);
	    if ($scope.autoupdate) {
		navigator.geolocation.getCurrentPosition($scope.updatePosition);
		return;
	    }

    //console.log(pos);
	    var p = { "latitude": pos.lat(), "longitude": pos.lng(), "altitude": "0" };

	    //	    updateMyMarker(pos);
	    $scope.game.my_crd = p;
	    $scope.updateWPS();

	    console.log("fake : ");
	    console.log(p);
	    sendUpdate(p, $scope.game.id);

	}

	$scope.initMap = function () {
	    console.log("init!");
	}

	/**
	 * Initiate timed functions
	 **/
	console.log (" Starting autoupdates");
	var options = {timeout:4000};
	navigator.geolocation.watchPosition( $scope.updatePosition, $scope.updatePositionError, options);
	$interval ( $scope.getPlayers, 3000 );
	$scope.getGameInfo();
	
    }]);