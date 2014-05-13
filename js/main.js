var ctx;
var w = 500;
var h = 400;
var fillColor = 'rgba(0, 0, 0, 0.1)';
var strokeColor = 'rgba(0, 0, 0, 0.2)';

(function (win, doc, Class, DT) {

    'use strict';

    var cv  = doc.getElementById('cv');

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
    var points = createRandomPoints(50);

    // for DEBUG.
    for (var i = 0, l = points.length; i < l; i++) {
        DT.utils.drawPoint(ctx, points[i]);
    }

    var triangles = DT.calculate(points);
    DT.utils.drawTriangles(ctx, triangles);

    for (var i = 0, t; t = triangles[i]; i++) {
        var circle = DT.getCircumscribedCircle(t);
        DT.utils.drawCircle(ctx, circle);
    }

}(window, document, Class, DT));
