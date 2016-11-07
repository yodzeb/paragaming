angular.module('starter', ['ionic', 'Api'])

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
		templateUrl: 'search.html',
		controller: 'searchCtrl'
	    })
	    .state('create', {
		url: '/create/:gameid',
		templateUrl: 'creation.html',
		controller: 'GameCreation'
	    });

	
	$urlRouterProvider.otherwise("index");
    })

    .controller ('GameCreation', [ '$scope', '$http', '$stateParams', 'apiCtf', function ($scope, $http, $stateParams, apiCtf) {
	

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
	

    }])

    .controller('MainCtrl', [ '$scope', 'apiCtf',  function($scope, apiCtf) {
	
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
	
    }])

    .controller('searchCtrl', ['$scope', 'apiCtf', function ($scope, apiCtf) {
	
	$scope.all_games;
	$scope.button = {};

	$scope.update_error = false;
	$scope.footer_message = "";

	$scope.updateGames = function () {
	    $scope.loading();
	    apiCtf.listGames().then (function (res) {
		$scope.all_games = res.data;
		$scope.update_error = 1;
		console.log($scope.all_games);
		$scope.footer_message = $scope.all_games.length +" game"+(($scope.all_games.length > 1)?"s":"")+" found";
	    }, function (res) {
		$scope.update_error = 2;
		$scope.footer_message = "error during loading";
		//error
	    });
	};

	$scope.loading = function (){
	    $scope.update_error = 0;
	    $scope.footer_message = "Loading";
	    $scope.button.enabled = false;
	}
	$scope.not_loading = function () {
	    $scope.button.text    = "Update!";
	    $scope.button.enabled = true;
	}

	$scope.loading();;
	$scope.updateGames();
    }]);