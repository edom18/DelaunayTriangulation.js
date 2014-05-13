(function (win, doc, Class, DT) {

    'use strict';

    var cv  = doc.getElementById('cv'),
        ctx = cv.getContext('2d'),
        w   = win.innerWidth,
        h   = win.innerHeight;

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

    var rect = new DT.Rectangle(new DT.Point(80, 100), new DT.Size(150, 50));
    DT.utils.drawRectangle(ctx, rect);

    var r = rect.diagonal / 2;
    var circle = new DT.Circle(rect.center, r);
    DT.utils.drawCircle(ctx, circle);

    DT.utils.drawPoint(ctx, rect.center);

    var super_triangle = DT.getExternalTriangle(rect);
    DT.utils.drawTriangle(ctx, super_triangle);

    cv.addEventListener('click', function (e) {
        var p = new DT.Point(e.pageX, e.pageY);
        console.log(super_triangle.hitTest(p));
    }, false);

}(window, document, Class, DT));
