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

    // onLoad () {},

    start() {
        this.localData = JSON.parse(cc.sys.localStorage.getItem('visitorData'));
        if (this.localData !== null) {
            this.nameEditBox.string = this.localData.name;
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
            this.sendLogonVisitorMsg();
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
        this.count = leftTime;
        this.clockLabel.string = this.count;
        this.clockLabel.node.active = true;
        this.callback = function () {
            this.count--;
            if (this.count === 0) {
                this.unschedule(this.callback);
                this.setStatusInfo("可以开始了");
                this.showStartBtn();
                this.clockLabel.node.active = false;
            }
            this.clockLabel.string = this.count;
        }
        this.schedule(this.callback, 1);
    },
    sendLogonVisitorMsg() {
        //var userData = JSON.parse(cc.sys.localStorage.getItem('visitorData'));
        var msg = {};
        if (this.localData !== null) {
            msg.entityID = this.localData.entityID;
        } else {
            msg.entityID = -1;
        }
        msg.name = this.nameEditBox.string;
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_VISITOR, msg);
    },
});
