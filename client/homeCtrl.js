/**
 * Created by vinhhoang on 17/08/2015.
 */
app.controller('homeCtrl', ['$scope', '$state', homeCtrl]);

function homeCtrl($scope, $state){
    var ctrl = this,
        data = {};

    ctrl.roomID = '';

    ctrl.connect = function (roomID, action) {
        console.log(action + roomID);
        data.action = action;
        data.roomID = roomID;
        $state.go('room', {data: data, roomID: roomID});
    };
}
