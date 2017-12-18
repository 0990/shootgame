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
    }
};

module.exports = Util;
