// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        clockLabel: cc.Label,
        rankLayer: cc.Node,
        killCountNode: cc.Label,
        centerClockLabel: cc.Label,
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
        this._rankLayerJS = this.rankLayer.getComponent('RankLayer');
    },

    setRank(index, string) {
        this._rankLayerJS.setRank(index, string);
    },
    setMeRank(string) {
        this._rankLayerJS.setMeRank(string);
    },
    start() {

    },
    showGetScore(count) {
        this.killCountNode.getComponent(cc.Label).string = "+"+count;
        let anim = this.killCountNode.getComponent(cc.Animation);
        anim.play();
    },
    setLeftClock(leftTime) {
        this.unschedule(this.callback);
        this.count = leftTime;
        this.clockLabel.string = "倒计时:" + this.count;
        this.clockLabel.node.active = true;
        this.callback = function () {
            this.count--;
            if (this.count <= 5) {
                this.centerClockLabel.node.active = true;
                this.centerClockLabel.string = this.count;
            }
            if (this.count === 0) {
                this.unschedule(this.callback);
                this.centerClockLabel.node.active = false;
                this.clockLabel.node.active = false;
            }
            this.clockLabel.string = "倒计时:" + this.count;
        }
        this.schedule(this.callback, 1);
    },


    // update (dt) {},
});
