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
cc.Class({
    extends: cc.Component,

    properties: {
        statusInfoLabel: cc.Label,
        startBtnNode: cc.Node,
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
        // if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT) {
        let code = this.getQueryString('code');
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
        }
    },
    setStatusInfo(info) {
        this.statusInfoLabel.string = info;
    },
    show(info) {
        if (typeof (info) !== undefined) {
            this.statusInfoLabel.string = info;
        }
        this.node.active = true;
    },
    hide() {
        this.node.active = false;
    },
    //登录
    clickStartBtn() {
        NetCtrl.createNewSocket(() => {
            if (G.accountType === Cmd.ACCOUNT_TYPE_WX) {
                this.sendLogonWXOpenID();
            } else {
                this.sendLogonVisitorMsg();
            }
        });
    },
    hideNameEditLayer() {
        this.nameEditLayer.active = false;
    },
    showNameEditLayer() {
        this.nameEditLayer.active = true;
    },
    showStartBtn() {
        this.startBtnNode.active = true;
    },
    hideStartBtn() {
        this.startBtnNode.active = false;
    },
    setLeftClock(leftTime) {
        // this.count = leftTime;
        // this.clockLabel.string = this.count;
        // this.clockLabel.node.active = true;
        // this.callback = function () {
        //     this.count--;
        //     if (this.count === 0) {
        //         this.unschedule(this.callback);
        //         this.setStatusInfo("可以开始了");
        //         this.showStartBtn();
        //         this.clockLabel.node.active = false;
        //     }
        //     this.clockLabel.string = this.count;
        // }
        // this.schedule(this.callback, 1);
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
    getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
});
