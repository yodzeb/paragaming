angular.module('starter', ['ionic'])

    .config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	    .state('index', {
		url: '/index',
		templateUrl: 'home.html'
	    })
	    .state('new', {
		url: '/new',
		templateUrl: 'new.html'
	    })
	    .state('join', {
		url: '/join',
		templateUrl: 'join.html'
	    })
	    .state('search', {
		url: '/search',
		templateUrl: 'search.html'
	    })
	    .state('create', {
		url: '/create/:gameid',
		templateUrl: 'creation.html',
		controller: 'GameCreation'
	    });

	
	$urlRouterProvider.otherwise("index");
    })

    .controller ('GameCreation', function ($scope, $http, $stateParams) {
	
	$scope.createGame = function ( gameid ) {
	    $scope.status.push("Creating game '"+gameid+"'");
	    var data = {
		"cmd" : "createGame",
		"gid" : gameid,
		"type": "CTF"
	    };
	    $http({
		method : 'POST',
		url    : api,
		data   : data
	    }).then(function successCallback(response) {
		$scope.status.push("Game created");
	    }, function errorCallback(response) {
		$scope.status.push("Error");
	    });
	}

	$scope.status = [];
	console.log("creating now");
	var api="/cgi-bin/api.pl";

	$scope.createGame($stateParams.gameid);
	

    })

    .controller('MainCtrl', function($scope) {
	
	$scope.game = { id:   "" };
	$scope.nick = { name: "" };

	$scope.types = [ "Capture the flag", "Capture the Star", "KILLER" ];
	
	$scope.newTask = function() {
	    console.log("new");
	    $scope.taskModal.show();
	};

	$scope.settingsList = [
	    { text: "Wireless", checked: true },
	    { text: "GPS", checked: false },
	    { text: "Bluetooth", checked: false }
	];
	
	$scope.pushNotificationChange = function() {
	    console.log('Push Notification Change', $scope.pushNotification.checked);
	};

	$scope.start = function () {
	    console.log ("starting game for "+$scope.nick.name+" (game: "+$scope.game.id+")");
	}
	
	$scope.pushNotification = { checked: true };
	$scope.emailNotification = 'Subscribed';
	
    });