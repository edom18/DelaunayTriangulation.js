/*
 * Utilities.
 *
 * Copyright (c) 2013 Kazuya Hiruma
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author   Kazuya Hiruma (http://css-eblog.com/)
 * @version  0.0.1
 */
(function (win, doc, ns, undefined) {

'use strict';

var objProto = Object.prototype,
    arrProto = Array.prototype,
    arrSlice = arrProto.slice,
    toString = objProto.toString;


/**
 * @namespace
 */
var util = {};

/* ----------------------------------------------------------------------------------------------
    FOR CHECKING UTILITES
------------------------------------------------------------------------------------------------- */
function hasProp(obj, prop) {
    return objProto.hasOwnProperty.call(obj, prop);
}

function isObject(obj) {
    return toString.call(obj) === '[object Object]';
}

function isFunction(obj) {
    return toString.call(obj) === '[object Function]';
}

function isString(obj) {
    return toString.call(obj) === '[object String]';
}

function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
}

function isBoolean(obj) {
    return toString.call(obj) === '[object Boolean]';
}

function isNull(obj) {
    return obj === null;
}

function isUndefined(obj) {
    return obj === undefined;
}

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

function isReference(obj) {
    return (isFunction(obj) || isArray(obj) || isObject(obj));
}



function isEmpty(obj) {

    var key;

    if (isFunction(obj)) {
        return false;
    }
    else if (isNumber(obj)) {
        return obj === 0;
    }
    else if (isArray(obj) || isString(obj)) {
           return obj.length === 0;
    }
    else if (isNull(obj)) {
        return true;
    }
    else if (isUndefined(obj)) {
        return true;
    }
    else if (isBoolean(obj)) {
        return !obj;
    }

    for (key in obj) if (hasProp(obj, key)) {
        return false;
    }

    return true;
}

/**
 * Bind function to context.
 */
function bind(func, context) {
    return function () {
        func.apply(context, arguments);
    };
}

function each (arr, func) {
    if (!isArray(arr)) {
        return false;
    }

    if (arr.forEach) {
        arr.forEach(func);
    }
    else {
        for (var i = 0, l = arr.length; i < l; i++) {
            func(arr[i], i);
        }
    }
}

function every (arr, func) {
    if (!isArray(arr)) {
        return false;
    }

    if (arr.every) {
        return arr.every(func);
    }
    else {
        for (var i = 0, l; i < l; i++) {
            if (!func(arr[i], i, arr)) {
                return false;
            }
        }

        return true;
    }
}

function some (arr, func) {
    if (!isArray(arr)) {
        return false;
    }

    if (arr.some) {
        return arr.some(func);
    }
    else {
        for (var i = 0, l; i < l; i++) {
            if (func(arr[i], i)) {
                return true;
            }
        }

        return false;
    }
}

function filter (arr, func) {
    if (!isArray(arr)) {
        return false;
    }

    var ret = [];

    if (arr.filter) {
        return arr.filter(func);
    }
    else {
        for (var i = 0, l; i < l; i++) {
            if (func(arr[i], i)) {
                ret.push(arr[i]);
            }
        }

        return ret;
    }
}

function clone(obj) {

    var ret  = null;

    if (isObject(obj)) {
        ret = {};

        for (var key in obj) {
            if (isReference(obj[key])) {
                ret[key] = clone(obj[key]);
            }
            else {
                ret[key] = obj[key];
            }
        }
    }
    else if (isArray(obj)) {
        ret = [];

        for (var i = 0, l = obj.length; i < l; i++) {
            if (isReference(obj[i])) {
                ret.push(clone(obj[i]));
            }
            else {
                ret.push(obj[i]);
            }
        }
    }
    else if (isFunction(obj)) {
        var tmp = obj.toString().replace(/[\r\n]*/gm, ''),
            match = tmp.match(/function\s*(.*?)\s*\((.*?)\)\s*{(.*?)}/i),
            name = match[1],
            argList = match[2].replace(/\s+/g, ''),
            contents = match[3];

        ret = new Function(argList, contents);
    }
    else {
        ret = obj;
    }

    return ret;
}


/**
 * copy arguments object properties to `obj`
 * @param {Object} obj base to be copy of properties.
 */
function copyClone(obj) {

    var args  = arrProto.slice.call(arguments, 1),
        force = false,
        src;

    if (isBoolean(args[args.length - 1])) {
        force = args.pop();
    }

    for (var i = 0, l = args.length; i < l; i++) {
        src = args[i];

        for (var prop in src) {
            if (force || !obj[prop]) {
                obj[prop] = args[i][prop];
            }
        }
    }

    return obj;
}

/**
 * Make a new array.
 * @param {Array} arr
 * @returns {Array} A new array object.
 */
function makeArr(arr) {
    return arrSlice.call(arr);
}

/**
 * Gives you indexOf function.
 * If browser gives you this method, return value with native function.
 * @param {Array} arr target array.
 * @param {*} item target item.
 */
function indexOf (arr, item) {
    if (arr.indexOf) {
        return arr.indexOf(item);
    }
    else {
        for (var i = 0, l = arr; i < l; ++i) if (arr[i] === item) return i;
    }
    return -1;
}

/**
 * Make HTML node with html text.
 * @param {string} html
 */
function makeHTMLNode(html) {
    var range = null,
        node  = null;

    if (html instanceof HTMLElement) {
        return html;
    }

    range = doc.createRange();
    range.deleteContents();
    range.selectNodeContents(doc.body);
    node = range.createContextualFragment(html);

    return node;
}

/**
 * return object by split string within `&` and `=`.
 * @returns {Object} splited parameters.
 */
function getParams(str) {

    var ret = {},
        tmp,
        tmp2,
        i = 0,
        l = 0;

    tmp = str.split('&');
    for (l = tmp.length; i < l; i++) {
        tmp2 = tmp[i].split('=');
        ret[tmp2[0]] = tmp2[1];
    }

    return ret;
}

/**
 * Get template text.
 * @param {string} id
 * @param {?Object} param
 */
function getTemplate(id, param) {
    param || (param = {});
    var temp = doc.getElementById('template-' + id);
    return (!temp) ? null : template(temp.innerHTML, param);
}

/**
 * Make text from tempalte with parameter.
 * @param {string} text template text.
 * @param {Object} param template value.
 */
function template(text, param) {
    var reg1 = /#{(.*?)}/g,
        ret = '';
    //var reg2 = /##{(.*)}/g;

    ret = text.replace(reg1, function ($0, $1) {
        return param[$1];
    });

    return ret;
}

/**
 * As inner Deferred class.
 * This will be used as simple deferred function.
 */
function _Deferred(func) {
    var _queue = [],
        _data,
        ret = {
            isResolved: isResolved,
            done: done,
            resolve: resolve
        };

    function done(func) {
        if (isFunction(func)) {
            _queue ? _queue.push(func) : func(_data);
        }

        return this;
    }
    function resolve(data) {
        if (isResolved()) {
            return;
        }

        var arr = _queue,
            i = 0,
            l = arr.length;

        _data = data;
        _queue = null;

        for (; i < l; i++) {
            arr[i].apply(arr[i], arguments);
        }
    }
    function isResolved() {
        return !_queue;
    }

    if (isFunction(func)) {
        func(ret);
    }

    return ret;
}

/**
 * Ajax utility class.
 */
function ajax(url, opt) {

    opt || (opt = {});

    var type = opt.type || 'GET',
        data = opt.data || null,

        def = new util.Deferred(),
        xhr = new XMLHttpRequest(),

        value = '',
        param = '',
        params = null;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                def.resolve(JSON.parse(xhr.responseText), xhr);
                def = null;
            }
            else {
                def.reject(xhr);
            }
        }
    };

    if (isObject(data)) {
        params = [];

        for (var name in data) {
            value = data[name];
            param = encodeURIComponent(name).replace(/%20/g, '+')
                + '=' + encodeURIComponent(value).replace(/%20/g, '+');
            params.push(param);
        }

        data = params.join('&');
    }

    xhr.open(type, url);

    if (/post/i.test(type)) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    xhr.send(data);

    return def;
}

/**
 * check property suppert with property name.
 * @param {string} prop css prop name.
 * @return {string} supported property name.
 */
var prefixList = ['-webkit-', '-moz-', '-ms-'];
function getCssPropSupport(prop) {

    var testDiv = doc.createElement('div'),
        propType = '',
        ch    = '',
        type1 = '',
        type2 = '',
        tmp = [],
        ret = null;

    if (prop in testDiv.style) {
        ret = prop;
    }
    else {
        for (var i = 0, l = prefixList.length; i < l; ++i) {
            propType = prefixList[i] + prop;
            tmp = /^(-)(\w+)-(\w)(\w+)$/.exec(propType);

            //e.g. webkitTransform
            type1 = tmp[2] + tmp[3].toUpperCase() + tmp[4];

            //e.g. WebkitTransform
            ch = tmp[2].slice(0, 1).toUpperCase();
            tmp[2] = tmp[2].slice(1);
            type2 = ch + tmp[2] + tmp[3].toUpperCase() + tmp[4];

            if (type1 in testDiv.style) {
                ret = type1;
                break;
            }
            else if (type2 in testDiv.style) {
                ret = type2;
                break;
            }
        }
    }

    testDiv = null;
    return ret;
}

function Deferred(func) {
    var _dSuccess = new _Deferred(),
        _dFail    = new _Deferred(),
        ret = {
            resolve: resolve,
            reject: reject,
            done: done,
            fail: fail
        };

    function resolve() {
        if (_dFail.isResolved()) {
            return false;
        }
        _dSuccess.resolve.apply(null, arguments);
    }

    function reject() {
        if (_dSuccess.isResolved()) {
            return false;
        }
        _dFail.resolve.apply(null, arguments);
    }

    function done() {
        _dSuccess.done.apply(null, arguments);
        return this;
    }

    function fail() {
        _dFail.done.apply(null, arguments);
        return this;
    }

    if (isFunction(func)) {
        func(ret);
    }

    return ret;
}

/////////////////////////////////////////////////////////////////////////

function when(arr) {

    var d = new Deferred(),
        i = arr.length,
        len = i,
        results = new Array(i);

    function _watch(result, index) {
        results[index] = result;

        if (!--len) {
            d.resolve(results);
            results = null;
            arr = null;
        }
    }

    while(i--) {
        (function (index) {
            arr[i].done(function (res) {
                _watch(res, index);
            });
        }(i));
    }

    return d;
}

/////////////////////////////////////////////////////////////////////////

/**
 * @class Throttle
 * @param {Number} ms millsecounds
 * @example
 * var throttle = new Throttle(1000);
 *
 * var i = 0;
 * var timer = setInterval(function () {
 *     i++;
 *     throttle.exec(function () {
 *         console.log(i);
 *     });
 * }, 32);
 */
function Throttle(ms) {

    var _timer,
        prevTime;

    function exec(func) {

        var now = +new Date(),
            delta;

        if (!isFunction(func)) {
            return false;
        }

        if (!prevTime) {
            func();
            prevTime = now;
            return;
        }

        clearTimeout(_timer);
        delta = now - prevTime;
        if (delta > ms) {
            func();
            prevTime = now;
        }
        else {
            _timer = setTimeout(function () {
                func();
                _timer = null;
                prevTime = now;
            }, ms);
        }
    }

    return {
        exec: exec
    };
}

/**
 * Chain callbacks.
 * @param {Function[]} [No arguments name] Call function objects as chain method.
 * @return undefined
 * @example
 *   chain(function (next) {... next(); }, function (next) {... next(); }, function (next) {... next(); }...);
 *       -> next is callback.
 */
function chain() {

    var actors = Array.prototype.slice.call(arguments);

    function next() {

        var actor = actors.shift(),
            arg = Array.prototype.slice.call(arguments);

        //push `next` method to argumetns to last.
        arg.push(next);

        //when `actor` is function, call it.
        (toString.call(actor) === '[object Function]') && actor.apply(actor, arg);
    }

    next();
}


/* --------------------------------------------------------------------
    EXPORT
----------------------------------------------------------------------- */
//for util
util.every       = every;
util.each        = each;
util.chain       = chain;
util.Throttle    = Throttle;
util.Deferred    = Deferred;
util.when        = when;
util.makeArr     = makeArr;
util.bind        = bind;
util.clone       = clone;
util.copyClone   = copyClone;
util.isObject    = isObject;
util.isFunction  = isFunction;
util.isString    = isString;
util.isNumber    = isNumber;
util.isArray     = isArray;
util.isReference = isReference;
util.isNull      = isNull;
util.isUndefined = isUndefined;
util.isEmpty     = isEmpty;
util.hasProp     = hasProp;
util.ajax        = ajax;
util.getParams   = getParams;
util.template    = template;
util.getTemplate = getTemplate;
util.makeHTMLNode = makeHTMLNode;
util.getCssPropSupport = getCssPropSupport;

util.nullFunction = function () {};
util.abstractFunction = function () {throw new Error('MUST BE IMPLEMENT THIS FUNCTION.');}

//export to global.
ns.util = util;

}(window, document, window));

