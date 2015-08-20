/**
 * Created by vinh on 6/12/2015.
 */
app.run(["$rootScope", "$state", function ($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireUser promise is rejected
        // and redirect the user back to the main page
        switch (error) {
            case "AUTH_REQUIRED":
                $state.go('adminLogin');
                break;
            case 'UNAUTHORIZED' :
                $state.go('unauthorized');
                break;
        }
    });

    $rootScope.$on("$stateChangeStart", function (evt, to, params) {
        if(to.redirectTo){
            evt.preventDefault();
            $state.go(to.redirectTo, params);
        }
    })
}]);


app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function ($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider
            //error
            .state('unauthorized', {
                template: '<h1>You are unauthorized</h1>'
            })
            //User view
            .state('home', {
                url:'/',
                templateUrl: 'client/welcome.ng.html',
                controller: 'homeCtrl as homeCtrl'
            })
            .state('room', {
                url:'/room/:roomID',
                params: {
                  data: {}
                },
                templateUrl: 'client/main.ng.html',
                controller: 'webRtcCtrl as wbRtcCtrl',
                redirectTo: 'room.chat'
            })
            .state('room.chat', {
                templateUrl: 'client/chat.ng.html'
            })
        ;

        $urlRouterProvider.otherwise("/");
    }]);