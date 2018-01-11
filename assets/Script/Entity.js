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
        // scoreLabel: cc.Label,
        avatarSprite: cc.Sprite,
        defaultFrame: cc.SpriteFrame,
        greenFrame: cc.SpriteFrame,
        yellowFrame: cc.SpriteFrame,
        redFrame: cc.SpriteFrame,
        // deadClip: cc.AudioClip,
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
        if (rotationDelta <= pressTime * G.config.rotationDelta) {
            newRotation = targetRotation;
        } else {
            let rotationChange = 0;
            if (this.rotation >= 0) {
                if (this.rotation - 180 < targetRotation && targetRotation < this.rotation) {
                    rotationChange = -pressTime * G.config.rotationDelta;
                } else {
                    rotationChange = pressTime * G.config.rotationDelta;
                }
            } else {
                if (this.rotation < targetRotation && targetRotation < this.rotation + 180) {
                    rotationChange = pressTime * G.config.rotationDelta;
                } else {
                    rotationChange = -pressTime * G.config.rotationDelta;;
                }
            }
            newRotation = lastRotation + rotationChange;
        }

        if (newRotation > 180) newRotation = newRotation - 360;
        if (newRotation < -180) newRotation = 360 + newRotation;

        let distance = input.pressTime * G.config.entitySpeed;
        let radian = lastRotation * Math.PI / 180;
        this.node.y += distance * Math.sin(radian);
        this.node.x += distance * Math.cos(radian);
        this.rotation = newRotation;
        this.node.rotation = -this.rotation;
    },
    init(info) {
        // this.entityID = info.entityID;
        //this.rotation = -info.rotation;
        this.rotation = 0;
        this.node.x = -100;
        this.node.y = -100;
        this.positionBuffer = new Array();
        this.node.color = cc.Color.WHITE;
        this.name = info.name;
        this.nameLabel.string = info.name;
        this.score = 0;
        this.killCount = 0;
        // if (info.ghostMode) {
        //     this.node.opacity = 80;
        // } else {
        //this.startProtect();
        // }
        if (info.new) {
            this.getComponent(cc.Animation).play();
        }
        this.entityID = info.entityID;
        this.dead = info.dead;
        this.applyDisplay(info);
        if (info.accountType === 2) {
            this.showAvatar(info.headImgUrl);
        } else {
            this.avatarSprite.spriteFrame = this.defaultFrame;
        }
    },
    applyDisplay(data) {
        this.hp = data.hp;
        this.score = data.score;
        let color = cc.Color.WHITE;
        if (this.hp <= 2) {
            this.getComponent(cc.Sprite).spriteFrame = this.redFrame;
        } else if (this.hp <= 4) {
            this.getComponent(cc.Sprite).spriteFrame = this.yellowFrame;
        } else {
            this.getComponent(cc.Sprite).spriteFrame = this.greenFrame;
        }
        this.avatarSprite.node.color = color;
        //this.scoreLabel.string = this.score;
    },
    startProtect() {
        this.scheduleOnce(() => {
            cc.log("protect cancel");
        }, G.config.protectTime);
    },
    playDeadAni() {
        var anim = this.avatarSprite.getComponent(cc.Animation);
        //var animName = self.node.name + 'ani';
        anim.play();
        anim.on('finished', this.onFinished, this);
        //播放音效
        //cc.audioEngine.playEffect(this.deadClip, false);
    },
    onFinished() {
        if (this.entityID === G.entityID) {
            // cc.director.loadScene('end');
        } else {
            this._managerJS.entityDied(this.node);
        }
    }

});
