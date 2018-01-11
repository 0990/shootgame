var Util = {
    getAngle(px1, py1, px2, py2) {
        //两点的x、y值
        let x = px2 - px1;
        let y = py2 - py1;
        let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        //斜边长度
        let cos = x / hypotenuse;
        let radian = Math.acos(cos);
        //求出弧度
        let angle = 180 / (Math.PI / radian);
        //用弧度算出角度       
        if (y < 0) {
            angle = -angle;
        } else if ((y == 0) && (x < 0)) {
            angle = 180;
        }
        return angle;
    },
    getQueryString(name) {
        if (cc.sys.isNative) return null;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    getDistance(x1, y1, x2, y2) {
        let x = x2 - x1;
        let y = y2 - y1;
        let distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return distance;
    },
    
};

module.exports = Util;
