/**
 * Created by vinhhoang on 17/08/2015.
 */
app.controller('webRtcCtrl', ['$scope', '$stateParams', '$filter', webRtcCtrl]);

function webRtcCtrl($scope, $stateParams, $filter) {
    var ctrl = this,
        connection = new RTCMultiConnection();

    //Global variable
    ctrl.connection = connection; //for reactive
    ctrl.msgTxt = '';
    ctrl.availableUsers = [];
    ctrl.data = $stateParams.data;
    ctrl.participants = [];
    ctrl.sessionDescription = {};
    ctrl.messageCollection = {};
    ctrl.currentChatTo = 'group';


    //Global methods
    ctrl.sendMessage = sendMessage;
    ctrl.keyPressHandler = keyPressHandler;
    ctrl.chatTo = chatTo;
    ctrl.countUnreadMessage = countUnreadMessage;

    /**
     * Connection operation
     */
    connection.onopen = function (e) {
        if (e.userid === connection.userid) return;

        if (ctrl.availableUsers && ctrl.availableUsers.length > 0) {
            for (var i = 0; i < ctrl.availableUsers.length; i++) {
                if (ctrl.availableUsers[i].userID === e.userid) return;
            }
        }

        //Set custom message handler for each peer
        connection.peers[e.userid].onCustomMessage = peerCustomMessageHandler;

        var user = {
            userID: e.userid,
            extra: e.extra
        };
        ctrl.availableUsers.push(user);
        $scope.$apply();
    };
    connection.onleave = function (e) {
        removeFromAvailableUsers(e.userid);
    };
    connection.onclose = function (e) {
        //console.log(e.userid + 'closing');
        removeFromAvailableUsers(e.userid);
    };
    //Custom message handler for default socket
    connection.onCustomMessage = function (publicMsg) {
        if (publicMsg.receiver === 'group') {
            if (ctrl.currentChatTo !== publicMsg.receiver) {
                publicMsg.data.isRead = false;
            }
        }
        saveToMessageCollection(publicMsg, true);
    };

    init();

    /**
     * Properties: sessionid, userid, extra
     */
    function init() {
        ctrl.sessionDescription = {
            channel: ctrl.data.roomID | $stateParams.roomID,
            userid: 'guest' + parseInt(Math.round(Math.random() * 60535) + 100000),
            extra: {},
            session: {
                data: true //data only
            }
        };
        connection.channel = ctrl.sessionDescription.channel;
        connection.userid = ctrl.sessionDescription.userid;
        connection.session = ctrl.sessionDescription.session;
        //connection.isAcceptNewSession = false;

        if (!ctrl.data) {
            joinRoom();
        } else {
            if (ctrl.data.action && ctrl.data.action === 'create') {
                createNewRoom();
            } else {
                joinRoom();
            }
        }

    }

    //create new room with given roomid
    function createNewRoom() {
        connection.open();
    }

    //join room with given roomid
    function joinRoom() {
        connection.connect();
    }

    /**
     * message = {
     *      sender: ctrl.sessionDescription.userid,
     *      receiver: ctrl.currentChatTo,
     *      data: {
     *          read: false,
     *          text: data
     *      }
     * }
     */
    function sendMessage() {
        //prepare message
        var message = {
            sender: ctrl.sessionDescription.userid,
            receiver: ctrl.currentChatTo,
            data: {
                isRead: true,
                text: ctrl.msgTxt
            }
        };

        //Save message to collection
        if (!ctrl.messageCollection[message.receiver])
            ctrl.messageCollection[message.receiver] = [];
        ctrl.messageCollection[message.receiver].push(message);

        if (message.receiver === 'group') {
            connection.sendCustomMessage(message);
        } else {
            connection.peers[message.receiver].sendCustomMessage(message);
        }

        //reset input
        ctrl.msgTxt = '';
    }

    //Enter to send text
    function keyPressHandler(e) {
        var keyCode = e.keyCode ? e.keyCode : e.which;

        if (keyCode === 13) {
            sendMessage();
        }
    }

    //Change chat partner
    function chatTo(userid) {
        ctrl.currentChatTo = userid;

        //when user change partner
        //messages from new partner will be load
        //and all message is read
        if (ctrl.messageCollection && ctrl.messageCollection[userid]) {
            angular.forEach(ctrl.messageCollection[userid], function (value, key) {
                if (!value.data.isRead) {
                    value.data.isRead = true;
                }
            });
        }
    }

    //When user leave room -> remove from available list and remove all related message
    function removeFromAvailableUsers(userid) {
        angular.forEach(ctrl.availableUsers, function (value, key) {
            if (value.userID === userid) ctrl.availableUsers.splice(key, 1);
        });

        removeMessage(userid);

        ctrl.currentChatTo = 'group';

        $scope.$apply();
        //console.log(ctrl.availableUsers);
    }
    function removeMessage(messageID) {
        if (ctrl.messageCollection[messageID])
            delete ctrl.messageCollection[messageID];
    }

    //Custom message handler for each peer
    function peerCustomMessageHandler(privateMsg) {
        if (ctrl.currentChatTo !== privateMsg.sender) {
            privateMsg.data.isRead = false;
        }
        saveToMessageCollection(privateMsg, false);
    }
    function saveToMessageCollection(message, isGroup) {
        var messageID = isGroup ? 'group' : message.sender;

        //Check exist. If not , do init then push to array
        if (!ctrl.messageCollection[messageID]) {
            ctrl.messageCollection[messageID] = [];
        }
        ctrl.messageCollection[messageID].push(message);
        $scope.$apply();
    }

    //Count unread message
    function countUnreadMessage(messages) {
        if (messages) {
            var unreadMessages = $filter('filter')(messages, {$: false});
            return unreadMessages.length;
        }
        return 0;
    }
}
