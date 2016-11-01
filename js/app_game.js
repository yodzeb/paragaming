angular.module('game', [ 'ionic', 'ngMap'])

    .config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	    .state('game', {
		url: '/game',
		templateUrl: 'g.html'
	    });	
	$urlRouterProvider.otherwise("game");
    })

    .controller('GameCtrl', function($scope, NgMap, $interval) {	
	$scope.game = { id:   "" };
	$scope.nick = { name: "" };
	$scope.map  = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
	
	$scope.my_marker;

	$scope.reinit  = function () {
	    getGameInfo().then(function(res) {
		$scope.game.id      = res["id"];
		$scope.game.players = res["players"];
	    });
	}

	$scope.updatePosition = function (pos) {
	    console.log ("Position update!")
	    var crd = pos.coords;
	    //sendUpdate(crd);
	    NgMap.getMap().then(function(map) {
		var center = new google.maps.LatLng(crd.latitude, crd.longitude)
		if (!($scope.my_marker == null))
		    $scope.my_marker.setMap(null);
		$scope.my_marker = new google.maps.Marker({
		    position: center,
		    title:"Hello World!"
		});
		$scope.my_marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
		$scope.my_marker.setMap(map);
		$scope.recenter(map);
	    });
	}
	
	$scope.recenter = function (map) {
	    
	    var bounds = new google.maps.LatLngBounds();
	    if ($scope.my_marker == null)
		return;
	    
	    // add my marker
	    bounds.extend     ( new google.maps.LatLng($scope.my_marker.position.lat(), $scope.my_marker.position.lng()));
	    
	    // add others
	    /*
	    for (o in others) {
		//alert("adding one other");
		bounds.extend ( new google.maps.LatLng(others[o].position.lat(), others[o].position.lng() ));
	    }
*/
	    
	    map.fitBounds(bounds);       //# auto-zoom
	    map.panToBounds(bounds);     //# auto-center
	}

	$scope.updatePositionError = function (err) {
	    console.log (err);
	}
	
	$scope.getPlayers =function () {
	    console.log ("update!");
	}

	NgMap.getMap().then(function(map) {
	    var opts = {
		zoom: 8,
		zoomControl: false,
		scaleControl: false,
		mapTypeControl: false,
		streetViewControl: false
	    };
	    map.setOptions(opts);
	    console.log ("setttings changed");
	});

	$scope.initMap = function () {
	    console.log("init!");
	}
	
	var options = {timeout:4000};
	navigator.geolocation.watchPosition( $scope.updatePosition, $scope.updatePositionError, options);
	
	$interval ( $scope.getPlayers, 3000 );
	
    });