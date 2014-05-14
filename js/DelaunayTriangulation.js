(function (win, doc, Class) {

    'use strict';

    // Namespace
    var DelaunayTriangle = {};
    var DT = DelaunayTriangle;

    /*! -----------------------------------------------------
      ドロネー三角形分割のためのユーティリティ関数
    --------------------------------------------------------- */

    /**
     * 外接円を得る
     * @param {Triangle} triangle 外接円を得たい三角形
     * @return {Circle} 外接円
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

        // 外接円の中心座標を計算
        var c = 2 * ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1));
        var x = ((y3 - y1) * (x2_2 - x1_2 + y2_2 - y1_2) + (y1 - y2) * (x3_2 - x1_2 + y3_2 - y1_2)) / c;
        var y = ((x1 - x3) * (x2_2 - x1_2 + y2_2 - y1_2) + (x2 - x1) * (x3_2 - x1_2 + y3_2 - y1_2)) / c;
        var _x = (x1 - x);
        var _y = (y1 - y);
        var r = Math.sqrt((_x * _x) + (_y * _y));

        return new Circle(new Point(x, y), r);
    }


    /**
     * 与えられた四角形が内接する三角形を得る
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
     * ドロネー三角形分割を計算
     * @params {Array.<Point>} points 計算対象の点群
     */
    function calculate(points) {

        // 見つかった三角形を保持する配列
        var triangles = [];

        // 一番外側の巨大三角形を生成
        // ここでは画面内の点限定として画面サイズを含む三角形を作る
        var position       = new Point(0, 0);
        var size           = new Size(w, h);
        var base_rect      = new Rectangle(position, size);
        var super_triangle = getExternalTriangle(base_rect);

        // 生成した巨大三角形をドロネー三角形郡に追加
        triangles.push(super_triangle);

        while(points.length !== 0) {

            // ひとつ目の点を取り出す
            var point = points.pop();

            // 外接円に点が含まれる三角形を見つける
            var hit_triangles = [];
            for (var i = 0, t; t = triangles[i]; i++) {
                if (t.hasPointInExternalCircle(point)) {
                    hit_triangles.push(t);
                }
            }

            var edge_stack = [];
            for (var i = 0, ht; ht = hit_triangles[i]; i++) {
                // 見つかった三角形の辺をスタックに積む
                edge_stack = edge_stack.concat(ht.edges);

                // 見つかった三角形を配列から削除
                var index = triangles.indexOf(ht);
                triangles.splice(index, 1);

                // 見つかった三角形を該当の点で分割し、
                // 新しく3つの三角形にする
                var A = ht.points[0];
                var B = ht.points[1];
                var C = ht.points[2];

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
            }

            // スタックが空になるまで繰り返す
            while (edge_stack.length !== 0) {

                // スタックから辺を取り出す
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

                // 選ばれた三角形が同一のものの場合はそれを削除して次へ
                if (triangle_ABC.isEqual(triangle_ABD)) {
                    var index_ABC = triangles.indexOf(triangle_ABC);
                    triangles.splice(index_ABC, 1);
                    var index_ABD = triangles.indexOf(triangle_ABD);
                    triangles.splice(index_ABD, 1);
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

    /**
     * Point class
     * @param {number} x X座標
     * @param {number} y Y座標
     */
    var Point = Class.extend({
        x: 0,
        y: 0,
        init: function (x, y) {
            this.x = x;
            this.y = y;
        },

        /**
         * 同値判定
         * @param {Point} point 判定対象の点
         * @return {boolean} 同じ点の場合true
         */
        isEqual: function (point) {
            return (this.x === point.x && this.y === point.y);
        }
    });

    /**
     * Size class
     * @param {number} width 幅
     * @param {number} height 高さ
     */
    var Size = Class.extend({
        width : 0,
        height: 0,
        init: function (width, height) {
            this.width  = width;
            this.height = height;
        },

        /** 
         * 同値判定
         * @param {Size} size 判定対象のSizeクラス
         * @return {boolean} サイズが同じ場合にtrue
         */
        isEqual: function (size) {
            return (this.width === size.width && this.height === size.height);
        }
    });

    /**
     * Edge class
     * @param {Point} start 辺の開始点
     * @param {Point} end 辺の終端点
     */
    var Edge = Class.extend({
        start: null,
        end  : null,
        init: function (start, end) {
            this.start = start;
            this.end   = end;
        },

        /**
         * 与えられた点を含んでいるか
         * @param {Point} point 調査対象の点
         * @return {boolean} 辺が与えれた点を含んでいたらtrue
         */
        hasPoint: function (point) {
            return (this.start.isEqual(point) || this.end.isEqual(point));
        },

        /**
         * 同値判定
         * @param {Edge} edge 判定対象の辺
         * @return {boolean} 対になる点が始点・終点問わず同じ位置にある場合にtrue
         */
        isEqual: function (edge) {
            return (
                (this.start.isEqual(edge.start) && this.end.isEqual(edge.end)) ||
                (this.start.isEqual(edge.end)   && this.end.isEqual(edge.start))
            );
        }
    });

    /**
     * Triangle class
     * @param {<Array>.Point} 三角形を構成するPointクラス配列
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
         * 同値判定
         * @param {Triangle} triangle 判定対象の三角形
         * @return {boolean} 各頂点がすべて同じならtrue
         */
        isEqual: function (triangle) {
            for (var i = 0, p; p = triangle.points[i]; i++) {
                if (!this.hasPoint(p)) {
                    return false;
                }
            }

            return true;
        }
    });

    /**
     * Rectangle class
     * @param {Point} position 四角形の左上の座標
     * @param {Size} size 四角形のサイズ
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
     * @param {Point} center 円の中心座標
     * @param {number} radius 半径
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

    ///////////////////////////////////////////////////////////////////////

    /*! ------------------------------------------------------------------
        描画用ユーティリティ関数
    ---------------------------------------------------------------------- */

    var utils = {};

    /**
     * Canvasに点を描画
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
     * Canvasに三角形を描画
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
     * Canvasに三角形郡を描画
     * @param {Canvasrenderingcontext2d} ctx
     * @param {Array.<Triangle>} triangles
     */
    function drawTriangles(ctx, triangles) {
        for (var i = 0, t; t = triangles[i]; i++) {
            drawTriangle(ctx, t);
        }
    }

    /**
     * Canvasに四角形を描画
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
     * Canvasに円を描画
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
