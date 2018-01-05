//var Global = require('Global');
cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
        btnLayer_OK: cc.Node,
        btnLayer_OKCancel: cc.Node,
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
    },
    setString: function (msg) {
        this.label.string = msg;
    },
    setType: function (type) {
        switch (type) {
            case G.AT.OK: {
                this.btnLayer_OKCancel.active = false;
                break;
            }
            case G.AT.OK_CANCEL: {
                this.btnLayer_OK.active = false;
                break;
            }
            default: {
                cc.assert(false);
            }
        }
    },
    setCallBack(okCallback, cancelCallback) {
        this.okCallback = null;
        this.cancelCallback = null;
        if (okCallback && typeof (okCallback) === "function") {
            this.okCallback = okCallback;
        }
        if (cancelCallback && typeof (cancelCallback) === "function") {
            this.cancelCallback = cancelCallback;
        }
    },
    clickOKButton: function () {
        if (this.okCallback) {
            this.okCallback();
        }
        this.node.destroy();
    },
    clickCancelButton: function () {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
        this.node.destroy();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
