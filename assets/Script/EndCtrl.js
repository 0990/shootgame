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
        statusLabel:cc.Label,
        startBtn:cc.Button,
        clockLabel:cc.Label,
        rankLayer:cc.Node,
        rankLabelPrefab:cc.Prefab,
    },
    onLoad(){
        let gameEnd = G.gameEnd;
        if(gameEnd.overReason===Cmd.OVER_REASON_KILLED){
            this.setStatusInfo('Killed! Wait For Next Round');
            this.startBtn.interactable = false;
            this.setLeftClock(gameEnd.leftTime);
        }else{
          let rank = 0;
           for (let i = 0; i < gameEnd.rankInfo.length; i++) {
                 let item = gameEnd.rankInfo[i];
                 let string = 'Number'+item.rank+":"+item.name;
                 let slot = cc.instantiate(this.rankLabelPrefab);
                 this.rankLayer.addChild(slot);
                 if (item.entityID === G.entityID) {
                    rank = item.rank;
                   // break;
                }
            }
            let string = "您当场排名" + rank + ',再战一局？'; 
            this.setStatusInfo(string);
        }
    },
    clickStartBtn(){
        NetCtrl.createNewSocket(() => {
            if (G.accountType === Cmd.ACCOUNT_TYPE_WX) {
                this.sendLogonWXOpenID();
            } else {
                this.sendLogonVisitorMsg();
            }
         }); 
    },
    sendLogonVisitorMsg() {
        var msg = {};
        msg.userID = G.userInfo.userID;
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_VISITOR, msg);
    },
    sendLogonWXOpenID() {
        var msg = {};
        msg.openID = G.userInfo.openID;
        NetCtrl.send(Cmd.MDM_MB_LOGON, Cmd.SUB_MB_LOGON_WX_OPENID, msg);
    },
    clockCallback(){
        this.count--;
        if (this.count === 0) {
            this.unschedule(this.callback);
            this.setStatusInfo("可以开始了");
            this.clockLabel.string='Start';
            this.startBtn.interactable = true;
        }
        this.clockLabel.string = this.count;
    },
    setStatusInfo(string){
        this.statusLabel.string = string;
    },
    setLeftClock(leftTime) {
        this.unschedule(this.clockCallback);
        this.count = leftTime;
        this.clockLabel.string = 'Start'+this.count;
        this.clockLabel.node.active = true;
        this.schedule(this.clockCallback, 1);
    },
});
