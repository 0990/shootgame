var NetCtrl = require('NetCtrl');
var Cmd = require('CmdLogon');
var Config = require('GlobalConfig');
var Util = require('Util');
window.G = {
    entityID: -1,
    rotationDelta: 20,
    gameStartTime: -1,
    accountType: 1,
}

cc.Class({
    extends: cc.Component,

    properties: {
        entityPrefab: cc.Prefab,
        bulletPrefab: cc.Prefab,
        canvas: cc.Node,
        entityLayer: cc.Node,
        bulletLayer: cc.Node,
        startLayer: cc.Node,
        actionLayer: cc.Node,
        showingLayer: cc.Node,
        camera: cc.Node,

        clientPrediction: false,
        serverReconciliation: false,
        interpolation: false,
        bulletClip: cc.AudioClip,
    },
    onSocketClose(event) {
        //非主动关闭的，要显示断线重连
        if (this.activeClose === false) {
            G.entityID = -1;
            this._startLayerJS.hideNameEditLayer();
            this._startLayerJS.showStartBtn();
            this._startLayerJS.show("网络已断,重连?");
            this.bulletLayer.active = false;
            this.entityLayer.active = false;
        }
    },
    // use this for initialization
    onLoad: function () {
        NetCtrl.dataEventHandler = this.node;
        this.node.on('gamemessage', this.onGameMessage, this);
        this.node.on('socketclose', this.onSocketClose, this);
        this.node.on('logon', this.onLogon, this);

        this._startLayerJS = this.startLayer.getComponent('StartLayer');
        this._startLayerJS.showNameEditLayer();
        this._startLayerJS.showStartBtn();
        this._startLayerJS.show('提示:可以自定义名字哦');

        this._actionLayerJS = this.actionLayer.getComponent('ActionLayer');
        this._actionLayerJS._managerJS = this;

        this._showingLayerJS = this.showingLayer.getComponent('ShowingLayer');
        //初始参数
        this.entityMap = new Map();
        this.bulletMap = new Map();

        //使用对象池
        this.entityPool = new cc.NodePool();
        this.bulletPool = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            let entity = cc.instantiate(this.entityPrefab);
            this.entityPool.put(entity);
        }

        for (let i = 0; i < 20; i++) {
            let bullet = cc.instantiate(this.bulletPrefab);
            this.bulletPool.put(bullet);
        }

        this.init();
    },
    shootBullet(worldX, worldY) {
        if (G.entityID === -1) return;
        if (!this.entityMap.has(G.entityID)) return;
        let now = new Date().getTime();
        if (now - this.lastShootTime < 600) return;
        this.lastShootTime = now;
        // let meNode = this.entityMap.get(G.entityID);
        // let meWorldP = meNode.parent.convertToWorldSpaceAR(meNode.getPosition());
        // cc.log(worldX);
        // cc.log(worldY);
        // cc.log(meWorldP);
        // let angle = Util.getAngle(meWorldP.x, meWorldP.y, worldX, worldY);
        // meNode.rotation = -angle;
        // cc.log(angle);
        let msg = {};
        NetCtrl.send(Cmd.MDM_GF_GAME, Cmd.SUB_MB_SHOOT, msg);
    },
    sendJumpMessage() {
        let msg = {};
        NetCtrl.send(Cmd.MDM_GF_GAME, Cmd.SUB_MB_JUMP, msg)
    },
    createEntity(info) {
        let entity = null;
        if (this.entityPool.size() > 0) {
            entity = this.entityPool.get();
        } else {
            entity = cc.instantiate(this.entityPrefab);
        }
        entity.parent = this.entityLayer;
        let entityJS = entity.getComponent('Entity');
        entityJS._managerJS = this;
        entityJS.init(info);
        this.entityMap.set(info.entityID, entityJS);
        return entityJS;
    },
    createBullet(info) {
        let bullet = null;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get();
        } else {
            bullet = cc.instantiate(this.bulletPrefab);
        }
        bullet.parent = this.bulletLayer;
        let bulletJS = bullet.getComponent('Bullet');
        bulletJS.init(info);
        this.bulletMap.set(info.bulletID, bulletJS);
        return bulletJS;
    },
    onLogon: function (msg) {
        msg = msg.detail;
        var data = msg.data;
        switch (msg.subID) {
            case Cmd.SUB_MB_LOGON_SUCCESS:
                {
                    cc.log("logon success");
                    G = data.entityInfo;
                    let userData = {
                        userID: G.userID,
                        name: G.name,
                    };
                    cc.sys.localStorage.setItem('visitorData', JSON.stringify(userData));
                    this.init();
                    this.bulletLayer.active = true;
                    this.entityLayer.active = true;
                    this._showingLayerJS.setLeftClock(data.leftTime);
                    for (let i = 0; i < data.entities.length; i++) {
                        this.createEntity(data.entities[i]);
                    }
                    this._actionLayerJS.show();
                    this._startLayerJS.hide();
                    this.schedule(this.calculateRank, 1);
                    break;
                }

            case Cmd.SUB_MB_LOGON_FAILURE:
                {
                    this.bulletLayer.active = false;
                    this.entityLayer.active = false;
                    this._startLayerJS.showNameEditLayer();
                    this._startLayerJS.showStartBtn();
                    this._startLayerJS.setLeftClock(data.leftTime);
                    this._startLayerJS.show("您已阵亡，下场在战！");
                    break;
                }
        }
    },
    init() {
        this.keyLeft = false;
        this.keyRight = false;
        this.keyUp = false;
        this.keyDown = false;
        this.inputSequenceNumber = 0;
        this.pendingInputs = [];
        this.activeClose = false;
        this.entityMap.clear();
        this.bulletMap.clear();
        this.entityLayer.removeAllChildren();
        this.bulletLayer.removeAllChildren();
        this.lastShootTime = 0;
    },
    entityDied(node) {
        this.entityPool.put(node);
    },
    onGameMessage: function (msg) {
        if (G.entityID === -1) return;
        msg = msg.detail;
        var data = msg.data;
        switch (msg.subID) {
            case Cmd.SUB_MB_CALCULATE_RESULT: {
                if (data.entityDeleteList) {
                    for (let i = 0; i < data.entityDeleteList.length; i++) {
                        let entityID = data.entityDeleteList[i];
                        if (G.entityID === entityID) {
                        } else {
                            let itemJS = this.entityMap.get(entityID);
                            itemJS.playDeadAni();
                            //anim.on('finished', this.onDeadAnimFinished, this);
                            this.entityMap.delete(entityID);
                            //this.entityPool.put(itemJS.node);
                        }
                    }
                }

                if (data.bulletDeleteList) {
                    for (let i = 0; i < data.bulletDeleteList.length; i++) {
                        let bulletID = data.bulletDeleteList[i];
                        if (this.bulletMap.has(bulletID)) {
                            let itemJS = this.bulletMap.get(bulletID);
                            this.bulletMap.delete(bulletID);
                            this.bulletPool.put(itemJS.node);
                        }
                    }
                }

                if (data.entityChangeList) {
                    for (let i = 0; i < data.entityChangeList.length; i++) {
                        let item = data.entityChangeList[i];
                        let itemJS = this.entityMap.get(item.entityID);
                        itemJS.applyDisplay(item);
                    }
                }

                break;
            }
            case Cmd.SUB_MB_NEW_ENTITY: {
                if (data.entityID === G.entityID) return;
                if (this.entityMap.has(data.entityID)) return;
                this.createEntity(data);
                break;
            }
            //接受所有玩家的状态
            case Cmd.SUB_MB_WORLD_STATE: {
                if (G.entityID === -1) return;
                let now = new Date().getTime();
                if (data.entities) {
                    for (let i = 0; i < data.entities.length; i++) {
                        let item = data.entities[i];
                        let entityJS = this.entityMap.get(item.entityID);
                        //entityJS.applyInfo(item);
                        //如果是我
                        if (item.entityID === G.entityID) {
                            entityJS.node.x = item.x;
                            entityJS.node.y = item.y;
                            entityJS.rotation = item.rotation;
                            entityJS.node.rotation = -item.rotation;
                            if (this.serverReconciliation) {
                                let j = 0;
                                while (j < this.pendingInputs.length) {
                                    let input = this.pendingInputs[j];
                                    if (input.inputSequenceNumber <= item.lastProcessedInput) {
                                        this.pendingInputs.splice(j, 1);
                                    } else {
                                        entityJS.applyInput(input);
                                        j++;
                                    }
                                }
                            } else {
                                this.pendingInputs = [];
                            }
                        } else {
                            if (this.interpolation) {
                                let timestamp = new Date().getTime();
                                entityJS.positionBuffer.push([timestamp, item.x, item.y, item.rotation]);
                            } else {
                                entityJS.node.x = item.x;
                                entityJS.node.y = item.y;
                                entityJS.node.rotation = -item.rotation;
                            }
                        }

                    }
                }
                break;
            }
            case Cmd.SUB_MB_SHOOT: {
                this.createBullet(data);
               // if (data.creatorID === G.entityID) {
                    cc.audioEngine.playEffect(this.bulletClip, false);
              //  }
                break;
            }
            // case Cmd.SUB_MB_DESTROY_BULLET: {
            //     for (let i = 0; i < data.length; i++) {
            //         let item = this.bulletMap.get(data[i]);
            //         this.bulletMap.delete(data[i]);
            //         this.bulletPool.put(item.node);
            //     }
            //     break;
            // }
            case Cmd.SUB_MB_RANK: {
                //this._showingLayerJS.setLeftClock(data.leftTime);
                // cc.log(data.leftTime);
                // cc.log(data.rankInfo);
                // for (let i = 0; i < data.rankInfo.length; i++) {
                //     let item = data.rankInfo[i];
                //     let string = "第" + i + "名，" + item.score + "分," + this.entityMap.get(item.entityID).name;
                //     this._showingLayerJS.setRank(i, string);
                // }

                break;
            }
            case Cmd.SUB_MB_GAME_END: {
                this.unschedule(this.calculateRank);
                if (data.overReason === Cmd.OVER_REASON_KILLED) {
                    this._startLayerJS.hideNameEditLayer();
                    if (data.ghostDead) {
                        this._startLayerJS.hideStartBtn();
                        // this._startLayerJS.setLeftClock(data.leftTime);
                        this._startLayerJS.show("您已阵亡，下场在战!");
                        this._startLayerJS.showStartBtn();
                    } else if (data.dead) {
                        this._startLayerJS.showStartBtn();
                        this._startLayerJS.show("还魂报仇(注意：您已阵亡，将不参与排名)！");
                    }
                } else {
                    let string = "";
                    if (G.dead) {
                        string = "当场您未存活，未有排行,再战一局？";
                    } else {
                        let rank = 0;
                        for (let i = 0; i < data.rankInfo.length; i++) {
                            let item = data.rankInfo[i];
                            if (item.entityID === G.entityID) {
                                rank = item.rank;
                                break;
                            }
                        }
                        string = "您当场排名" + rank + ',再战一局？';
                    }

                    this._startLayerJS.showStartBtn();
                    this._startLayerJS.showNameEditLayer();
                    this._startLayerJS.show(string);
                }
                this.bulletLayer.active = false;
                this.entityLayer.active = false;
                this._actionLayerJS.hide();
                this.activeClose = true;
                G.entityID = -1;
                NetCtrl.close();
                break;
            }
        }
        return;
    },
    onDestroy: function () {
        this.node.off('gamemessage', this.onGameMessage, this);

    },
    update(dt) {
        if (G.entityID === -1) return;
        this.processInputs(dt);
        this.checkBulletValid();
        if (this.interpolation) {
            this.interpolateEntities();
        }
    },
    processInputs(dt) {
        let targetRotation = this._actionLayerJS.getTargetRotation();
        if (targetRotation == null) return;
        let input = { pressTime: dt };
        input.targetRotation = targetRotation;
        input.inputSequenceNumber = this.inputSequenceNumber++;
        input.entityID = G.entityID;
        NetCtrl.send(Cmd.MDM_GF_GAME, Cmd.SUB_MB_MOVE, input);

        if (this.clientPrediction) {
            let entityJS = this.entityMap.get(G.entityID);
            entityJS.applyInput(input);
        }

        this.pendingInputs.push(input);
    },
    checkBulletValid() {
        let now = new Date().getTime();
        let deleteList = new Array();
        this.bulletMap.forEach(function (item, key, mapObj) {
            if (now - item.createTime >= G.bulletLiveTime) {
                deleteList.push(key);
            }
        });

        for (let i = 0; i < deleteList.length; i++) {
            let item = this.bulletMap.get(deleteList[i]);
            this.bulletMap.delete(deleteList[i]);
            this.bulletPool.put(item.node);
        }
    },
    interpolateEntities() {
        let now = new Date().getTime();
        let render_timeStamp = now - (1000 / G.sendWorldRate);
        this.entityMap.forEach(function (entityJS, key, mapObj) {
            if (key !== G.entityID) {
                let buffer = entityJS.positionBuffer;
                while (buffer.length >= 2 && buffer[1][0] <= render_timeStamp) {
                    buffer.shift();
                }
                if (buffer.length >= 2 && buffer[0][0] <= render_timeStamp && buffer[1][0] >= render_timeStamp) {
                    let x0 = buffer[0][1];
                    let x1 = buffer[1][1];
                    let y0 = buffer[0][2];
                    let y1 = buffer[1][2];
                    let t0 = buffer[0][0];
                    let t1 = buffer[1][0];
                    let r0 = buffer[0][3];
                    let r1 = buffer[1][3];
                    let distance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                    if (distance > G.entitySpeed - 5) {
                        entityJS.node.x = x1;
                        entityJS.node.y = y1;
                        entityJS.node.rotation = -r1;
                        entityJS.rotation = -entityJS.node.rotation;
                    } else {
                        entityJS.node.x = x0 + (x1 - x0) * (render_timeStamp - t0) / (t1 - t0);
                        entityJS.node.y = y0 + (y1 - y0) * (render_timeStamp - t0) / (t1 - t0);
                        entityJS.node.rotation = -(r0 + (r1 - r0) * (render_timeStamp - t0) / (t1 - t0));
                        entityJS.rotation = -entityJS.node.rotation;
                    }
                    // entityJS.displayDirection(-entityJS.node.rotation);
                }
            }
        });
    },
    lateUpdate: function (dt) {
        if (G.entityID === -1) return;
        let meNode = this.entityMap.get(G.entityID).node;
        let targetPos = this.entityMap.get(G.entityID).node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        if (meNode.x < 640) {
            targetPos.x = 640;
        } else if (meNode.x > 2560 - 640) {
            targetPos.x = 2560 - 640;
        }
        if (meNode.y < 360) {
            targetPos.y = 360;
        } else if (meNode.y > 1440 - 360) {
            targetPos.y = 1440 - 360;
        }
        this.camera.position = this.camera.parent.convertToNodeSpaceAR(targetPos);
    },
    calculateRank() {
        let objArr = new Array();
        this.entityMap.forEach(function (entityJS, key, mapObj) {
            if (entityJS.dead === false) {
                let obj = {};
                obj.entityID = key;
                obj.score = entityJS.score;
                objArr.push(obj);
            }
        });
        objArr.sort(function (a, b) {
            if (a.score < b.score) {
                return true;
            } else if (a.score > b.score) {
                return false;
            } else {
                return a.entityID < b.entityID;
            }
        });
        this._showingLayerJS.setRank(0, "");
        this._showingLayerJS.setRank(1, "");
        this._showingLayerJS.setRank(2, "");
        for (let i = 0; i < objArr.length; i++) {
            if (i < 3) {
                let index = i + 1;
                let entityJS = this.entityMap.get(objArr[i].entityID);
                let string = "第" + index + "名" + entityJS.score + "分:" + entityJS.name;
                this._showingLayerJS.setRank(i, string);
            }
        }
        let meRank = 0;
        let string = "";
        if (G.dead) {
            string = "已阵亡无排名";
        } else {
            for (let i = 0; i < objArr.length; i++) {
                if (objArr[i].entityID === G.entityID) {
                    meRank = i + 1;
                    break;
                }
            }
            string = "我是第" + meRank + "名" + objArr[meRank - 1].score + "分";
        }
        this._showingLayerJS.setMeRank(string);
    },
});