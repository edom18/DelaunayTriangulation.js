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

        return new Circle(new Point(x, y), r);
    }


    /**
     * Get a external triangle.
     * @param {Rectangle} rect wrapped points rectangle.
     * @return {Triangle}
     */
    function getExternalTriangle(rect) {
        var cx = rect.center.x;
        var cy = rect.center.y;
        var r  = rect.diagonal / 2;
        var _2r = 2 * r;
        var _r3r = Math.sqrt(3) * r;

        var A = new Point((cx - _r3r), (cy - r));
        var B = new Point((cx + _r3r), (cy - r));
        var C = new Point(cx, (cy + _2r));

        return new Triangle([A, B, C]);
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
     * Size class
     * @param {number} width
     * @param {number} height
     */
    var Size = Class.extend({
        width : 0,
        height: 0,
        init: function (width, height) {
            this.width  = width;
            this.height = height;
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

    /**
     * Rectangle class
     * @param {Point} position Rectangle position at top left corner.
     * @param {Size} size Rectangle size.
     */
    var Rectangle = Class.extend({
        position: null,
        size    : null,
        center  : null,
        diagonal: 0,
        init: function (position, size) {
            this.position = position;
            this.size   = size;
            var x = position.x + (size.width  / 2);
            var y = position.y + (size.height / 2);
            this.center = new Point(x, y);

            var dx = size.width;
            var dy = size.height;
            this.diagonal = Math.sqrt((dx * dx) + (dy * dy));
        }
    });

    /**
     * Circle class
     * @param {Point} center A center coordinate.
     * @param {number} radius
     */
    var Circle = Class.extend({
        radius: 0,
        center: null,
        init: function (center, radius) {
            this.center = center;
            this.radius = radius;
        }
    });

    //////////////////////////////////////////////////////////////

    var utils = {};

    /**
     * Draw a point to a canvas.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Point} point
     */
    function drawPoint(ctx, point) {
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draw a triangle to a canvas.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Triangle} triangle
     */
    function drawTriangle(ctx, triangle) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
            ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
            ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
            ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw a triangle to a canvas.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Triangle} triangle
     */
    function drawRectangle(ctx, rectangle) {
        ctx.beginPath();
            ctx.rect(rectangle.position.x, rectangle.position.y, rectangle.size.width, rectangle.size.height);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * Draw a circle to a canvas.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Circle} Circle
     */
    function drawCircle(ctx, circle) {
        ctx.beginPath();
            ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
    }

    utils.drawPoint     = drawPoint;
    utils.drawTriangle  = drawTriangle;
    utils.drawCircle    = drawCircle;
    utils.drawRectangle = drawRectangle;

    /*! -----------------------------------------------
        EXPORTS
    --------------------------------------------------- */
    win.DelaunayTriangle = win.DT = DelaunayTriangle;

    DelaunayTriangle.utils = utils;
    DelaunayTriangle.getCircumscribedCircle = getCircumscribedCircle;
    DelaunayTriangle.getExternalTriangle    = getExternalTriangle;

    DelaunayTriangle.Point     = Point;
    DelaunayTriangle.Size      = Size;
    DelaunayTriangle.Edge      = Edge;
    DelaunayTriangle.Triangle  = Triangle;
    DelaunayTriangle.Rectangle = Rectangle;
    DelaunayTriangle.Circle    = Circle;

}(window, document, Class));
