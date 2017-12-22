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
        avatarSprite: cc.Sprite,
        defaultFrame: cc.SpriteFrame,
        directionNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },
    showAvatar(headImgUrl) {
        let self = this;
        if (headImgUrl && headImgUrl != ' ') {
            let imgurl = headImgUrl.substr(0, headImgUrl.length - 1) + "96";
            cc.loader.load({
                url: imgurl, type: 'jpg'
            }, function (err, texture) {
                if (err) {
                    // self.showOriginAvatar();
                } else {
                    self.avatarSprite.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        } else {
            //self.showOriginAvatar();
        }
    },
    applyInput(input) {
        let targetRotation = input.targetRotation;
        let lastRotation = this.rotation;
        let pressTime = input.pressTime;
        let newRotation = lastRotation;
        let rotationDelta = Math.abs(targetRotation - lastRotation);
        if (rotationDelta >= 180) {
            rotationDelta = Math.abs(360 - rotationDelta);
        }
        if (rotationDelta <= pressTime * G.rotationDelta) {
            newRotation = targetRotation;
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
            newRotation = lastRotation + rotationChange;
        }

        if (newRotation > 180) newRotation = newRotation - 360;
        if (newRotation < -180) newRotation = 360 + newRotation;

        let distance = input.pressTime * G.entitySpeed;
        let radian = lastRotation * Math.PI / 180;
        this.node.y += distance * Math.sin(radian);
        this.node.x += distance * Math.cos(radian);
        this.rotation = newRotation;
        this.node.rotation = -this.rotation;
        // this.displayDirection(this.rotation);
    },
    // update() {
    //     let radian = -this.rotation * Math.PI / 180;
    //     this.directionNode.x = (G.entityRadius + 8) * Math.cos(radian);
    //     this.directionNode.y = (G.entityRadius + 8) * Math.sin(radian);
    // },
    displayDirection(rotation) {

    },
    init(info) {
        // this.entityID = info.entityID;
        //this.rotation = -info.rotation;
        this.rotation = 0;
        this.node.x = -100;
        this.node.y = -100;
        this.positionBuffer = new Array();
        this.node.color = cc.Color.WHITE;
        this.nameLabel.string = info.name;
        if (info.ghostMode) {
            this.node.opacity = 80;
        } else {
            this.startProtect();
        }
        this.applyDisplay(info);
        if (info.accountType === 2) {
            this.showAvatar(info.headImgUrl);
        } else {
            this.avatarSprite.spriteFrame = this.defaultFrame;
        }
    },
    // applyInfo(info) {
    //     // this.entityID = info.entityID;
    //     this.hp = info.hp;
    //     let color = cc.Color.WHITE;
    //     if (this.hp < 2) {
    //         color = cc.Color.RED;
    //     } else if (this.hp < 4) {
    //         color = cc.Color.YELLOW;
    //     } else {
    //         color = cc.Color.GREEN;
    //     }
    //     this.node.color = color;
    //     this.rotation = info.rotation;
    // },
    applyDisplay(data) {
        this.hp = data.hp;
        this.score = data.score;
        let color = cc.Color.WHITE;
        if (this.hp <= 2) {
            color = cc.Color.RED;
        } else if (this.hp <= 4) {
            color = cc.Color.YELLOW;
        } else {
            color = cc.Color.GREEN;
        }
        this.avatarSprite.node.color = color;
    },
    startProtect() {
        this.scheduleOnce(() => {
            cc.log("protect cancel");
        }, G.protectTime);
    }
});
