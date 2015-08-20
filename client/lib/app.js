app = angular.module('webRtc', [
    'angular-meteor',
    'ui.router',
    'ionic'
]);

function onReady() {
    angular.bootstrap(document, ['webRtc']);
}

if (Meteor.isCordova)
    angular.element(document).on("deviceready", onReady);
else
    angular.element(document).ready(onReady);

