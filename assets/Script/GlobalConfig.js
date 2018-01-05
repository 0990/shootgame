window.G = {
    userInfo: {},
    entityID: -1,
    rotationDelta: 20,
    gameStartTime: -1,
    accountType: -1,
    code: null,
    openID: null,
}

module.exports = {
    debugMode: false,
    // logonHost: "ws://192.168.0.100",
    logonHost: "wss://xujialong.jny2016.cn",

    logonPort: 8500,
    //websocket协议
    wsProtocol: "yueZhanMJ",
    speed: 50,
}
