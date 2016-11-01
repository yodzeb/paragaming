var api_app = angular.module('Api', [])

    .factory('apiCtf', ['$http', function($http) {

	var api_url="/cgi-bin/api.pl";

	return {

            getGameInfo: function(gameid) {
		var data = {
		    "cmd" : "getGameInfo",
		    "gid" : gameid
		}
		return $http({
                    method : 'POST',
                    url    : api_url,
                    data   : data
		});
            }
	};
    }]);