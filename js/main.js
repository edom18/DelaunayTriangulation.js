var ctx;

(function (win, doc, Class, DT) {

    'use strict';

    var cv  = doc.getElementById('cv'),
        w   = win.innerWidth,
        h   = win.innerHeight;

    ctx = cv.getContext('2d');
    cv.width  = w;
    cv.height = h;

    function createRandomPoints(num) {
        var points = [];
        var x, y;
        for (var i = 0; i < num; i++) {
            x = Math.random() * w;
            y = Math.random() * h;
            points.push(new DT.Point(x, y));
        }
        return points;
    }

    // 三角分割したい点をランダムに生成
    var points = createRandomPoints(10);

    // for DEBUG.
    for (var i = 0, l = points.length; i < l; i++) {
        DT.utils.drawPoint(ctx, points[i]);
    }
    var triangles = DT.calculate(points);
    for (var i = 0, l = triangles.length; i < l; i++) {
        DT.utils.drawTriangle(ctx, triangles[i]);
    }

}(window, document, Class, DT));
