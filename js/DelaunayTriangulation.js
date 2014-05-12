(function (win, doc, Class) {

    'use strict';

    // Namespace
    var DelaunayTriangle = {};
    var DT = DelaunayTriangle;

    /*!
     * Utility functions for Delaunay.
     */

    /**
     * Get a circumscribed circle from a triangle.
     * @param {Triangle} triangle
     * @return {Circle}
     */
    function getCircumscribedCircle(triangle) {

        var x1 = triangle.points[0].x;
        var y1 = triangle.points[0].y;
        var x2 = triangle.points[1].x;
        var y2 = triangle.points[1].y;
        var x3 = triangle.points[2].x;
        var y3 = triangle.points[2].y;

        var x1_2 = x1 * x1;
        var x2_2 = x2 * x2;
        var x3_2 = x3 * x3;
        var y1_2 = y1 * y1;
        var y2_2 = y2 * y2;
        var y3_2 = y3 * y3;

        // Calc circle's center.
        var c = 2 * ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1));
        var x = ((y3 - y1) * (x2_2 - x1_2 + y2_2 - y1_2) + (y1 - y2) * (x3_2 - x1_2 + y3_2 - y1_2)) / c;
        var y = ((x1 - x3) * (x2_2 - x1_2 + y2_2 - y1_2) + (x2 - x1) * (x3_2 - x1_2 + y3_2 - y1_2)) / c;
        var _x = (x1 - x);
        var _y = (y1 - y);
        var r = Math.sqrt((_x * _x) + (_y * _y));

        // console.log(x, y, r);

        return new Circle(new Point(x, y), r);
    }

    /**
     * Point class
     * @param {number} x
     * @param {number} y
     */
    var Point = Class.extend({
        x: 0,
        y: 0,
        init: function (x, y) {
            this.x = x;
            this.y = y;
        }
    });

    /**
     * Edge class
     * @param {Point} start
     * @param {Point} end
     */
    var Edge = Class.extend({
        start: null,
        end  : null,
        init: function (start, end) {
            this.start = start;
            this.end   = end;
        }
    });

    /**
     * Triangle class
     * @param {<Array>.Point}
     */
    var Triangle = Class.extend({
        points: null,
        init: function (points) {
            this.points = points;
        }
    });

    var Circle = Class.extend({
        radius: 0,
        center: null,
        init: function (center, radius) {
            this.center = center;
            this.radius = radius;
        }
    });


    /*! -----------------------------------------------
        EXPORTS
    --------------------------------------------------- */
    win.DelaunayTriangle = win.DT = DelaunayTriangle;

    DelaunayTriangle.getCircumscribedCircle = getCircumscribedCircle;
    DelaunayTriangle.Point    = Point;
    DelaunayTriangle.Edge     = Edge;
    DelaunayTriangle.Triangle = Triangle;
    DelaunayTriangle.Circle   = Circle;

}(window, document, Class));
