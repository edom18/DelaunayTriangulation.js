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

    ctx.beginPath();
        ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
        ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
        ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
    ctx.closePath();
    ctx.stroke();

    var circle = DT.getCircumscribedCircle(triangle);

    ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

}(window, document, Class, DT));
