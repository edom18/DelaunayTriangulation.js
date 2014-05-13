(function (win, doc, Class) {

    'use strict';

    // Namespace
    var DelaunayTriangle = {};
    var DT = DelaunayTriangle;

    /*! -----------------------------------------------------
        Utility functions for Delaunay.
    --------------------------------------------------------- */

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
     * Caluculate a delaunay triangle.
     * @params {Array.<Point>} points
     */
    function calculate(points) {

        // 見つかった三角形を保持する配列
        var triangles = [];

        // 一番外側の巨大三角形を生成
        // ここでは画面内の点限定として画面サイズを含む三角形を作る
        var super_triangle = getExternalTriangle(new Rectangle(new Point(0, 0), new Size(w, h)));

        // 生成した巨大三角形をドロネー三角形郡に追加
        triangles.push(super_triangle);

        while(points.length !== 0) {

            // ひとつ目の点を取り出す
            var point = points.pop();

            // 点を内包する三角形を見つける
            var triangle;
            for (var i = 0, t; t = triangles[i]; i++) {
                if (t.hasPointInExternalCircle(point)) {
                    triangle = t;
                    break;
                }
            }

            // 見つかった三角形の辺をスタックに積む
            var edge_stack = [].concat(triangle.edges);

            // 見つかった三角形を配列から削除
            var index = triangles.indexOf(triangle);
            triangles.splice(index, 1);

            // 見つかった三角形を該当の点で分割し、
            // 新しく3つの三角形にする
            var A = triangle.points[0];
            var B = triangle.points[1];
            var C = triangle.points[2];

            var new_triangle1 = new Triangle([A, B, point]);
            var new_triangle2 = new Triangle([B, C, point]);
            var new_triangle3 = new Triangle([C, A, point]);

            triangles.push(new_triangle1);
            triangles.push(new_triangle2);
            triangles.push(new_triangle3);

            // for DEBUG.
            // debugger;
            // drawPoint(ctx, point);
            // drawTriangles(ctx, triangles);

            // スタックが空になるまで繰り返す
            while (edge_stack.length !== 0) {
                var edge = edge_stack.pop();

                // 辺を共有する三角形を見つける
                var common_edge_triangles = [];

                for (var i = 0, t; t = triangles[i]; i++) {
                    if (t.hasEdge(edge)) {
                        common_edge_triangles.push(t);
                    }
                }

                // 共有辺（これを辺ABとする）を含む2個の三角形をABC, ABDとする
                // もし、三角形ABCの外接円に点Dが入る場合は、共有辺をflipし、辺AD/DB/BC/CAをスタックにpushする
                // つまり、見つかった三角形をリストから削除し、新しい辺リストをスタックに積む
                // さらに、新しくできた三角形をリストに加える
                var triangle_ABC = common_edge_triangles[0];
                var triangle_ABD = common_edge_triangles[1];

                // 共有する辺を持つ三角形がふたつ見つからなければスキップ
                if (!triangle_ABD) {
                    continue;
                }

                // あとで使うため、頂点A,Bを保持しておく
                var point_A = edge.start;
                var point_B = edge.end;

                // 三角形ABCの頂点のうち、共有辺以外の点を取得（つまり点C）
                var point_C = triangle_ABC.noCommonPointByEdge(edge);

                // 三角形ABDの頂点のうち、共有辺以外の点を取得（つまり点D）
                var point_D = triangle_ABD.noCommonPointByEdge(edge);

                // 三角形ABCの外接円を取得
                var external_circle = getCircumscribedCircle(triangle_ABC); 
                // for DEBUG.
                // debugger;
                // ctx.clearRect(0, 0, win.innerWidth, win.innerHeight);
                // utils.drawTriangle(ctx, triangle_ABC);
                // utils.drawTriangle(ctx, triangle_ABD);
                // utils.drawCircle(ctx, external_circle);

                // 頂点Dが三角形ABCの外接円に含まれてるか判定
                if (external_circle.hitTest(point_D)) {
                    // debugger;

                    // 三角形リストから三角形を削除
                    var index1 = triangles.indexOf(common_edge_triangles[0]);
                    triangles.splice(index1, 1);
                    var index2 = triangles.indexOf(common_edge_triangles[1]);
                    triangles.splice(index2, 1);

                    // 共有辺をflipしてできる三角形を新しく三角形郡に追加
                    var triangle_ACD = new Triangle([
                        point_A,
                        point_C,
                        point_D
                    ]);
                    var triangle_BCD = new Triangle([
                        point_B,
                        point_C,
                        point_D
                    ]);

                    triangles.push(triangle_ACD);
                    triangles.push(triangle_BCD);

                    // for DEBUG.
                    // ctx.clearRect(0, 0, w, h);
                    // drawTriangles(ctx, triangles);
                    // drawTriangle(ctx, triangle_ACD);
                    // drawTriangle(ctx, triangle_BCD);

                    // 上記三角形の辺をedge stackに追加
                    var other_edge1 = triangle_ABC.otherEdgeByEdge(edge);
                    var other_edge2 = triangle_ABD.otherEdgeByEdge(edge);

                    edge_stack = edge_stack.concat(other_edge1);
                    edge_stack = edge_stack.concat(other_edge2);
                }
            }
        }

        // 最後に、巨大三角形と頂点を共有している三角形をリストから削除
        var final_triangles = [];
        for (var i = 0, sp; sp = super_triangle.points[i]; i++) {
            for (var j = 0, l = triangles.length; j < l; j++) {
                if (triangles[j] && triangles[j].hasPoint(sp)) {
                    triangles[j] = null;
                }
            }
        }

        for (var i = 0, l = triangles.length; i < l; i++) {
            if (triangles[i]) {
                final_triangles.push(triangles[i]);
            }
        }

        triangles = null;

        return final_triangles;
    }

    var Vector2 = Class.extend({
        x: 0,
        y: 0,
        init: function (x, y) {
            if (Point.prototype.isPrototypeOf(x)) {
                this.x = x.x;
                this.y = x.y;
            }
            else {
                this.x = x;
                this.y = y;
            }
        },
        norm: function () {
            return Math.sqrt((this.x * this.x) + (this.y * this.y));
        },
        normalize: function () {
            var nrm = this.norm();

            if (nrm !== 0) {
                nrm  = 1 / nrm;
                this.x *= nrm;
                this.y *= nrm;
            }
            return this;
        },
        add: function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },
        sub: function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },
        multiply: function (v) {
            this.x *= v.x;
            this.y *= v.y;
            return this;
        },
        multiplyScalar: function (s) {
            this.x *= s;
            this.y *= s;
            return this;
        },
        cross: function (v) {
            return (this.x * v.y) - (this.y * v.x);
        },
        dot: function (v) {
            return (this.x * v.x) + (this.y * v.y);
        },
        clone: function () {
            return new Vector2(this.x, this.y);
        }
    });

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
        },
        isEqual: function (point) {
            return (this.x === point.x && this.y === point.y);
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
        },
        isEqual: function (size) {
            return (this.width === size.width && this.height === size.height);
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
        },
        toVector2: function () {
            var v1 = new Vector2(this.start);
            var v2 = new Vector2(this.end);
            return v2.sub(v1);
        },

        /**
         * 与えられた点を含んでいるか
         * @param {Point} point 調査対象の点
         * @return {boolean} 辺が与えれた点を含んでいたらtrue
         */
        hasPoint: function (point) {
            return (this.start.isEqual(point) || this.end.isEqual(point));
        },
        isEqual: function (edge) {
            return (
                (this.start.isEqual(edge.start) && this.end.isEqual(edge.end)) ||
                (this.start.isEqual(edge.end)   && this.end.isEqual(edge.start))
            );
        }
    });

    /**
     * Triangle class
     * @param {<Array>.Point}
     */
    var Triangle = Class.extend({
        points: null,
        edges : null,
        init: function (points) {
            this.points = points;
            this.edges = [
                new Edge(points[0], points[1]),
                new Edge(points[1], points[2]),
                new Edge(points[2], points[0])
            ];
        },

        /**
         * 与えられた辺を含まない点を返す
         * @param {Edge} edge 調査対象の辺
         * @return {Point} 与えられた辺に含まれない点
         */
        noCommonPointByEdge: function (edge) {
            for (var i = 0, l = this.points.length; i < l; i++) {
                if (!edge.hasPoint(this.points[i])) {
                    return this.points[i];
                }
            }

            return null;
        },

        /**
         * 与えられた辺以外の辺を返す
         * @param {Edge} edge 調査対象の辺
         * @return {Array.<Edge>} 該当の辺以外の辺の配列
         */
        otherEdgeByEdge: function (edge) {
            var result = [];
            for (var i = 0, e; e = this.edges[i]; i++) {
                if (!e.isEqual(edge)) {
                    result.push(e);
                }
            }
            return result;
        },

        /**
         * 与えられた辺を含んでいるかチェック
         * @param {Edge} edge 調査対象の辺
         * @return {boolean} 与えられた辺を含んでいたらtrue
         */
        hasEdge: function (edge) {
            for (var i = 0, e; e = this.edges[i]; i++) {
                if (this.edges[i].isEqual(edge)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 与えられた点の頂点があるか確認
         * @param {Pointl} point 調査対象の点
         * @return {boolean} 対象の点が頂点にあったらtrue
         */
        hasPoint: function (point) {
            for (var i = 0, p; p = this.points[i]; i++) {
                if (p.isEqual(point)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 与えられた点が外接円に含まれるか確認
         * @param {Point} point 調査対象の点
         * @return {boolean} 外接円に含まれていればtrue
         */
        hasPointInExternalCircle: function (point) {
            var external_circle = getCircumscribedCircle(this);
            return external_circle.hitTest(point);
        },

        /**
         * 引数の点が三角形の内側にあるか判定
         * @param {Point} point
         * @return {boolean} 内側にある場合にtrue
         */
        hitTest: function (point) {
            var v1 = this.edges[0].toVector2();
            var v2 = this.edges[1].toVector2();
            var v3 = this.edges[2].toVector2();

            var p1 = this.points[0];
            var p2 = this.points[1];
            var p3 = this.points[2];

            var pv = new Vector2(point);

            var p1_pv = pv.clone().sub(new Vector2(p1));
            var p2_pv = pv.clone().sub(new Vector2(p2));
            var p3_pv = pv.clone().sub(new Vector2(p3));

            var test1 = v1.cross(p1_pv) > 0;
            var test2 = v2.cross(p2_pv) > 0;
            var test3 = v3.cross(p3_pv) > 0;

            return (test1 && test2 && test3);
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
        },

        /**
         * 円内に引数の点が含まれているか確認
         * @param {Point} point
         * @return {boolean} 円内に点が含まれている場合にtrue
         */
        hitTest: function (point) {
            var x = point.x - this.center.x;
            var y = point.y - this.center.y;
            var len = Math.sqrt((x * x) + (y * y));
            
            return len < this.radius;
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
        ctx.fillStyle = typeof(fillColor) !== 'undefined' ? fillColor : 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = typeof(strokeColor) !== 'undefined' ? strokeColor : 'rgba(0, 0, 0, 1.0)';
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
     * Draw triangles to a canvas.
     * @param {Canvasrenderingcontext2d} ctx
     * @param {Array.<Triangle>} triangles
     */
    function drawTriangles(ctx, triangles) {
        for (var i = 0, t; t = triangles[i]; i++) {
            drawTriangle(ctx, t);
        }
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
        ctx.save();
        ctx.strokeStyle = typeof(strokeColor) !== 'undefined' ? strokeColor : 'rgba(0, 0, 0, 1.0)';
        ctx.beginPath();
            ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    utils.drawPoint     = drawPoint;
    utils.drawTriangle  = drawTriangle;
    utils.drawTriangles = drawTriangles;
    utils.drawCircle    = drawCircle;
    utils.drawRectangle = drawRectangle;

    /*! -----------------------------------------------
        EXPORTS
    --------------------------------------------------- */
    win.DelaunayTriangle = win.DT = DelaunayTriangle;

    DelaunayTriangle.utils = utils;
    DelaunayTriangle.calculate              = calculate;
    DelaunayTriangle.getCircumscribedCircle = getCircumscribedCircle;
    DelaunayTriangle.getExternalTriangle    = getExternalTriangle;

    DelaunayTriangle.Point     = Point;
    DelaunayTriangle.Size      = Size;
    DelaunayTriangle.Edge      = Edge;
    DelaunayTriangle.Triangle  = Triangle;
    DelaunayTriangle.Rectangle = Rectangle;
    DelaunayTriangle.Circle    = Circle;

}(window, document  , Class));
