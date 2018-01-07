//var Global = require('Global');
cc.Class({
    extends: cc.Component,

    properties: {
        alertPrefab: {
            default: null,
            type: cc.Prefab
        },
        nodePrint: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        G.globalNode = this;
    },

    alert: function (msg, type, okCallback, cancelCallback) {
        let alert = cc.instantiate(this.alertPrefab);
        let alertJS = alert.getComponent('Alert');
        cc.director.getScene().addChild(alert, 1000);
        alertJS.setString(msg);
        alertJS.setType(type);
        alertJS.setCallBack(okCallback, cancelCallback);
    },
    print: function (msg) {
        this.nodePrint.opacity = 255;
        this.nodePrint.setPosition(0, 0);
        this.nodePrint.getComponent(cc.Label).string = msg;
        let spawn = cc.spawn(cc.moveBy(3, 0, 150), cc.fadeOut(3.0));
        this.nodePrint.runAction(spawn);
    },
});
