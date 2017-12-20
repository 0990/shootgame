var constant = {
    //登录命令

    MDM_GP_LOGON: 1,//广场登录

    //登录模式
    SUB_GP_LOGON_GAMEID: 1,//I D 登录
    SUB_GP_LOGON_ACCOUNTS: 2,//帐号登录
    SUB_GP_REGISTER_ACCOUNTS: 3,//注册帐号
    SUB_MB_WX_LOGON_FIRST: 4,
    SUB_MB_WX_LOGON_SECOND: 5,
    SUB_MB_LOGON_VISITOR: 6,
    SUB_MB_CHECK_VERSION: 9,
    //登录结果
    SUB_GP_LOGON_SUCCESS: 100,//登录成功
    SUB_GP_LOGON_FAILURE: 101,//登录失败
    SUB_GP_LOGON_FINISH: 102,//登录完成

    //登录命令
    MDM_MB_LOGON: 100,//广场登录

    //登录模式
    SUB_MB_LOGON_GAMEID: 1,//I D 登录
    SUB_MB_LOGON_ACCOUNTS: 2,//帐号登录
    SUB_MB_REGISTER_ACCOUNTS: 3,//注册帐号

    //登录结果
    SUB_MB_LOGON_SUCCESS: 100,//登录成功
    SUB_MB_LOGON_FAILURE: 101,//登录失败

    MDM_GF_GAME: 200,

    SUB_MB_MOVE: 1,
    SUB_MB_SHOOT: 2,

    SUB_MB_WORLD_STATE: 3,//所有玩家状态

    SUB_MB_GAME_END: 4,       //游戏结束
    SUB_MB_RANK: 5,           //排名
    SUB_MB_DESTROY_BULLET: 6,
    SUB_MB_NEW_ENTITY: 7,      //新玩家加入
    SUB_MB_DESTROY_ENTITY: 8,  //玩家死亡
    SUB_MB_CALCULATE_RESULT:9,

    OVER_REASON_KILLED: 0,
    OVER_REASON_NORMAL: 1,
};


module.exports = constant