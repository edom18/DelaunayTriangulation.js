(function (win, doc, Class, DT) {

    'use strict';

    var cv  = doc.getElementById('cv'),
        ctx = cv.getContext('2d'),
        w   = win.innerWidth,
        h   = win.innerHeight;

    cv.width  = w;
    cv.height = h;

    var x1 = 120;
    var y1 = 80;
    var x2 = 220;
    var y2 = 120;
    var x3 = 125;
    var y3 = 150;

    var vertecies = [
        new DT.Point(x1, y1),
        new DT.Point(x2, y2),
        new DT.Point(x3, y3)
    ];

    var triangle = new DT.Triangle(vertecies);
    DT.utils.drawTriangle(ctx, triangle);

    var circle = DT.getCircumscribedCircle(triangle);
    DT.utils.drawCircle(ctx, circle);

}(window, document, Class, DT));
