// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
var NetCtrl = require('NetCtrl');
var Cmd = require('CmdLogon');
var Util = require('Util');
cc.Class({
    extends: cc.Component,

    properties: {
        statusInfoLabel: cc.Label,
        startBtn: cc.Button,
        nameEditLayer: cc.Node,
        nameEditBox: cc.EditBox,
        clockLabel: cc.Label,
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        // G.alert("网络连接失败，请检查网络", G.AT.OK);
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.login({
                success: function (info) {
                    wx.getUserInfo({
                        success: function (res) {
                            let userInfo = res.userInfo;
                            cc.log(userInfo.nickName);
                            NetCtrl.createNewSocket(() => {
                                var msg = {};
                                msg.code = info.code;
                                msg.name = userInfo.nickName;
                                msg.avatarUrl = userInfo.avatarUrl;
                                NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_WX_TEMP, msg);
                            });
                        }
                    })
                }
            });
        } else {
            let code = Util.getQueryString('code');
            if (code) {
                let msg = {};
                msg.code = code;
                NetCtrl.createNewSocket(() => {
                    NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_WX_LOGON_FIRST, msg);
                });
            } else {
                let localData = JSON.parse(cc.sys.localStorage.getItem('visitorData'));
                if (localData !== null && localData.name) {
                    this.nameEditBox.string = localData.name;
                }
                NetCtrl.createNewSocket(() => {
                    this.sendLogonVisitorMsg();
                });
            }
        }

        this.startBtn.interactable = false;
        NetCtrl.dataEventHandler = this.node;
        this.node.on('joinfail', this.onJoinFail, this);
        this.node.on('logonsuccess', this.onLogonSuccess, this);
    },
    onJoinFail(msg) {
        msg = msg.detail;
        let data = msg.data;
        this.startBtn.interactable = false;
        this.failTime = new Date().getTime();
        this.leftTime = data.leftTime;
        this.setLeftClock(data.leftTime);
        this.statusInfoLabel.string = "Game Over,Wait For Next Round!";
    },
    onLogonSuccess(msg) {
        msg = msg.detail;
        let data = msg.data;
        if (data.dead) {
            this.startBtn.interactable = false;
            this.statusInfoLabel.string = "Game Over,Wait For Next Round!";
            this.failTime = new Date().getTime();
            this.leftTime = data.leftTime;
            this.setLeftClock(data.leftTime);
        } else {
            this.startBtn.interactable = true;
            this.statusInfoLabel.string = "Click Start!";
        }
    },
    sendLogonWX() {
        var msg = {};
        msg.code = "";
        msg.name = "";
        msg.avatarUrl = "";
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_WX_GAME, msg);
    },
    // //登录
    // clickStartBtn() {
    //     NetCtrl.createNewSocket(() => {
    //         // if (G.accountType === Cmd.ACCOUNT_TYPE_WX) {
    //         //     this.sendLogonWXOpenID();
    //         // } else {
    //         this.sendLogonVisitorMsg();
    //         //  }
    //     });
    // },
    clickJoinGame() {
        cc.log("click join");
        NetCtrl.createNewSocket(() => {
            cc.log("create new socket");
            var msg = {};
            msg.userID = G.userID;
            msg.name = this.nameEditBox.string;
            NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_JOIN_GAME, msg);
        });
    },
    clockCallback() {
        let count = parseInt(this.leftTime - (new Date().getTime() - this.failTime) / 1000);
        if (count <= 0) {
            this.unschedule(this.clockCallback);
            this.setStatusInfo("可以开始了");
            this.clockLabel.string = 'Start';
            this.startBtn.interactable = true;
        } else {
            this.clockLabel.string = 'Start' + count;
        }
    },
    setStatusInfo(string) {
        this.statusInfoLabel.string = string;
    },
    setLeftClock(leftTime) {
        this.unschedule(this.clockCallback);
        this.clockLabel.string = 'Start' + this.leftTime;
        this.schedule(this.clockCallback, 1);
    },
    sendLogonVisitorMsg() {
        let localData = JSON.parse(cc.sys.localStorage.getItem('visitorData'));
        var msg = {};
        if (localData !== null) {
            msg.userID = localData.userID;
        } else {
            msg.userID = 0;
        }
        msg.name = this.nameEditBox.string;
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_VISITOR, msg);
    },
    sendLogonWXOpenID() {
        var msg = {};
        msg.openID = G.openID;
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_WX_OPENID, msg);
    },
    onDestroy() {
        this.node.off('joinfail', this.onJoinFail, this);
    }
});
