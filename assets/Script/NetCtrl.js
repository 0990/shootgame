//定义全局的变量
var Config = require('GlobalConfig');
var Cmd = require('CmdLogon');
var NetControl = {
    _socket: null,  //当前的webSocket的对象
    connect: function (callback, num) {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            if (this._socket.readyState > WebSocket.OPEN) {
                this._socket.close();
                this.createNewSocket(callback, num);
            } else {
                if (this.isOpen() === true) {
                    if (callback) callback(num);
                }
            }
        } else {
            this.createNewSocket(callback);
        }
    },
    close: function () {
        this.activeClose = true;
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            this._socket.close();
        }
    },
    dataEventHandler: null,
    fire(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        } else {
            G.debug("dataEventHandle not existed");
        }
    },
    createNewSocket: function (callback, num) {
        //清空以前socket的绑定
        if (this._socket) {
            this._socket.onopen = undefined;
            this._socket.onmessage = undefined;
            this._socket.onclose = undefined;
            this._socket.onerror = undefined;
        }
        this._socket = new WebSocket(Config.logonHost + ":" + Config.logonPort, Config.wsProtocol);
        this._socket.onopen = () => {
            this.activeClose = false;
            if (callback) {
                callback(num);
            }
        };
        this._socket.onclose = (event) => {
            this._onClose(event)
        };
        this._socket.onmessage = (event) => {
            this._onMessage(event);
        };
        this._socket.onerror = (event) => {
            cc.log(event);
        }
    },
    _onClose: function (event) {
        cc.log(event);
        if (!this.activeClose) {
            let sceneName = cc.director.getScene().name;
            if (sceneName === 'start') {
                G.alert("网络连接失败，请检查网络", G.AT.OK);
            } else {
                G.gameEnd = { overReason: Cmd.OVER_REASON_OFFLINE };
                cc.director.loadScene('end');
            }
        }
        // this.fire("socketclose", event);
    },
    _onMessage: function (obj) {
        var msg = JSON.parse(obj.data);
        var data = msg.data;
        switch (msg.mainID) {
            case Cmd.MDM_MB_LOGON: {
                //this.fire('logon',msg);
                switch (msg.subID) {
                    case Cmd.SUB_MB_LOGON_SUCCESS:
                        {
                            cc.log("logon success");
                            //G.userInfo = data.entityInfo;
                            //G.config = data.config;
                            //G.entityID = G.userInfo.entityID;
                            // G = data;
                            let userData = {
                                userID: data.userID,
                                name: data.name,
                            };
                            cc.sys.localStorage.setItem('visitorData', JSON.stringify(userData));
                            G.userID = data.userID;
                            cc.log("logon success", data);
                            this.fire('logonsuccess', msg);
                            this.close();
                            //cc.director.loadScene('game');
                            break;
                        }
                    case Cmd.SUB_MB_LOGON_FAILURE:
                        {
                            cc.log("logon failed");
                            G.alert("进入失败，重新登入游戏？", G.AT.OK_CANCEL, () => {
                                cc.director.loadScene('start');
                            });
                            this.close();
                            // this.fire('logonfail', msg);
                            break;
                        }
                    case Cmd.SUB_MB_JOIN_GAME_SUCCESS:
                        {
                            G.userInfo = data.userInfo;
                            G.config = data.config;
                            G.entityID = data.entityID;
                            cc.director.loadScene('game');
                            break;
                        }
                    case Cmd.SUB_MB_JOIN_GAME_FAILURE:
                        {
                            this.fire('joinfail', msg);
                            G.alert("进入失败，重新登入游戏？", G.AT.OK_CANCEL, () => {
                                cc.director.loadScene('start');
                            });
                            this.close();
                            break;
                        }
                }
                break;
            }
            case Cmd.MDM_GF_GAME: {
                this.fire('gamemessage', msg);
                break;
            }
        }
    },
    send: function (mainID, subID, msg) {
        if (this.isOpen()) {
            msg.mainID = mainID;
            msg.subID = subID;
            this._socket.send(JSON.stringify(msg));
        }
    },

    isOpen() {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            return this._socket.readyState === WebSocket.OPEN;
        } else {
            return false;
        }
    },

    isConnecting() {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            return this._socket.readyState === WebSocket.CONNECTING;
        } else {
            return false;
        }
    },
    //先检测是否断线，如果断钱了重连，再发送消息
    safeSend(mainID, subID, msg) {
        this.connect(() => {
            msg.mainID = mainID;
            msg.subID = subID;
            this._socket.send(JSON.stringify(msg));
        });
    },
    sendCmd(mainID, subID) {
        let msg = {};
        this.send(mainID, subID, msg);
    }
};
module.exports = NetControl;