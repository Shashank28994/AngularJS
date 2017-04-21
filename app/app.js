(function (angular) {
    var jigsawApp = angular.module('JigsawApp', ['ngRoute','GameSettings','JigsawGame']);
    jigsawApp.config(config);

    function config($routeProvider){
        $routeProvider
            .when('/settings',{
            controller: 'GameSettingsController',
            templateUrl : 'app/GameSettings/GameSettingsView.html'
            })
            .when('/game',{
                controller: 'JigsawGameController',
                templateUrl : 'app/JigsawGame/JigsawGameView.html'
            })
            .otherwise({
                redirectTo :'/game'
            });
    }
})(angular);
