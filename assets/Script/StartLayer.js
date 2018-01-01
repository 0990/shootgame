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
        }

        NetCtrl.dataEventHandler = this.node;
        this.node.on('logonfail',this.onLogonFail,this);
    },
    onLogonFail(msg){
        msg = msg.detail;
        let data = msg.data;
        this.startBtn.interactable = false;
        this.setLeftClock(data.leftTime);
        this.statusInfoLabel.string = "Game Over,Wait For Next Round!";
    },
    //登录
    clickStartBtn() {
        NetCtrl.createNewSocket(() => {
           // if (G.accountType === Cmd.ACCOUNT_TYPE_WX) {
           //     this.sendLogonWXOpenID();
           // } else {
                this.sendLogonVisitorMsg();
          //  }
        });
    },
    clockCallback(){
        this.count--;
        if (this.count === 0) {
            this.unschedule(this.callback);
            this.setStatusInfo("可以开始了");
            this.clockLabel.string = 'Start';
            this.startBtn.interactable = true;
        }
        this.clockLabel.string = this.count;
    },
    setLeftClock(leftTime) {
        this.unschedule(this.clockCallback);
        this.count = leftTime;
        this.clockLabel.string = 'Start'+this.count;
        this.clockLabel.node.active = true;
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
    onDestroy(){
        this.node.off('logonfail',this.onLogonFail,this);
    }
});
