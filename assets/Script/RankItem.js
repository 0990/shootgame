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
        nameLabel: cc.Label,
        avatarSprite: cc.Sprite,
        scoreLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },
    setItemData(data) {
        this.nameLabel.string = data.rank + "   " + data.name;
        this.scoreLabel.string = data.killCount + "   " + data.score;
        this.showAvatar(data.headImgUrl);
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


    // update (dt) {},
});
