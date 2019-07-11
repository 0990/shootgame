
cc.Class({
    extends: cc.Component,

    properties: {
        joy: cc.Node,
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
        // this.node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
        //     if (this._managerJS) {
        //         this._managerJS.shootBullet(event.getLocationX(), event.getLocationY());
        //     }
        // }, this);
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this._managerJS) {
                this._managerJS.sendShootMessage(event.getLocationX(), event.getLocationY());
            }
        }, this);
        // add key down and key up event
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this._joyJS = this.joy.getComponent('JoyStick');
    },
    clickShoot() {
        if (this._managerJS) {
            this._managerJS.sendShootMessage();
        }
    },
    clickJump() {
        if (this._managerJS) {
            this._managerJS.sendJumpMessage();
        }
    },
    hide() {
        this.node.active = false;
    },
    show() {
        this.node.active = true;
    },
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    getTargetRotation() {
        if (this.keyLeft) {
            return 180;
        } else if (this.keyRight) {
            return 0;
        } else if (this.keyUp) {
            return 90;
        } else if (this.keyDown) {
            return -90;
        } else {
            return this._joyJS.getTargetAngle();
        }
    },
    onKeyDown: function (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.left:
                {
                    this.keyLeft = true;
                    break;
                }
            case cc.macro.KEY.right:
                {
                    this.keyRight = true;
                    break;
                }
            case cc.macro.KEY.up:
                {
                    this.keyUp = true;
                    break;
                }
            case cc.macro.KEY.down:
                {
                    this.keyDown = true;
                    break;
                }

        }
    },
    onKeyUp: function (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.left:
                {
                    this.keyLeft = false;
                    break;
                }
            case cc.macro.KEY.right:
                {
                    this.keyRight = false;
                    break;
                }
            case cc.macro.KEY.up:
                {
                    this.keyUp = false;
                    break;
                }
            case cc.macro.KEY.down:
                {
                    this.keyDown = false;
                    break;
                }
        }
    },
});
