var Config = require('GlobalConfig');
cc.Class({
    extends: cc.Component,

    properties: {
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
        nameLabel: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    applyInput(input) {
        let targetRotation = input.targetRotation;
        let lastRotation = this.rotation;
        let pressTime = input.pressTime;
        // if (parseInt(targetRotation) === parseInt(this.rotation)) return;  
        if (Math.abs(targetRotation - this.rotation) <= input.pressTime * G.rotationDelta) {
            this.rotation = targetRotation;
        } else {
            let rotationChange = 0;
            if (this.rotation >= 0) {
                if (this.rotation - 180 < targetRotation && targetRotation < this.rotation) {
                    rotationChange = -pressTime * G.rotationDelta;
                } else {
                    rotationChange = pressTime * G.rotationDelta;
                }
            } else {
                if (this.rotation < targetRotation && targetRotation < this.rotation + 180) {
                    rotationChange = pressTime * G.rotationDelta;
                } else {
                    rotationChange = -pressTime * G.rotationDelta;;
                }
            }
            this.rotation = lastRotation + rotationChange;
        }


        let distance = input.pressTime * G.entitySpeed;
        let radian = lastRotation * Math.PI / 180;
        this.node.y += distance * Math.sin(radian);
        this.node.x += distance * Math.cos(radian);
        this.node.rotation = -this.rotation;
    },
    init(info) {
        this.entityID = info.entityID;
        this.rotation = 0;
        this.node.x = 0;
        this.node.y = 0;
        this.positionBuffer = new Array();
        this.node.color = cc.Color.WHITE;
        this.nameLabel.string = info.name;
        if (info.ghostMode) {
            this.node.opacity = 100;
        }
    },
    applyInfo(info) {
        // this.entityID = info.entityID;
        this.hp = info.hp;
        let color = cc.Color.WHITE;
        if (this.hp < 2) {
            color = cc.Color.RED;
        } else if (this.hp < 4) {
            color = cc.Color.YELLOW;
        } else {
            color = cc.Color.GREEN;
        }
        this.node.color = color;
        this.rotation = info.rotation;
    },
});
