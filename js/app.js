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
	    });

	
	$urlRouterProvider.otherwise("index");
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