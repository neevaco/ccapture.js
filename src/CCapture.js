;(function() {

"use strict";

var objectTypes = {
'function': true,
'object': true
};

(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.GIF = f();
    }
})(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
    }({
        1: [ function(require, module, exports) {
            function EventEmitter() {
                this._events = this._events || {};
                this._maxListeners = this._maxListeners || undefined;
            }
            module.exports = EventEmitter;
            EventEmitter.EventEmitter = EventEmitter;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;
            EventEmitter.defaultMaxListeners = 10;
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
                this._maxListeners = n;
                return this;
            };
            EventEmitter.prototype.emit = function(type) {
                var er, handler, len, args, i, listeners;
                if (!this._events) this._events = {};
                if (type === "error") {
                    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                        er = arguments[1];
                        if (er instanceof Error) {
                            throw er;
                        } else {
                            var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                            err.context = er;
                            throw err;
                        }
                    }
                }
                handler = this._events[type];
                if (isUndefined(handler)) return false;
                if (isFunction(handler)) {
                    switch (arguments.length) {
                      case 1:
                        handler.call(this);
                        break;

                      case 2:
                        handler.call(this, arguments[1]);
                        break;

                      case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;

                      default:
                        args = Array.prototype.slice.call(arguments, 1);
                        handler.apply(this, args);
                    }
                } else if (isObject(handler)) {
                    args = Array.prototype.slice.call(arguments, 1);
                    listeners = handler.slice();
                    len = listeners.length;
                    for (i = 0; i < len; i++) listeners[i].apply(this, args);
                }
                return true;
            };
            EventEmitter.prototype.addListener = function(type, listener) {
                var m;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events) this._events = {};
                if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
                if (!this._events[type]) this._events[type] = listener; else if (isObject(this._events[type])) this._events[type].push(listener); else this._events[type] = [ this._events[type], listener ];
                if (isObject(this._events[type]) && !this._events[type].warned) {
                    if (!isUndefined(this._maxListeners)) {
                        m = this._maxListeners;
                    } else {
                        m = EventEmitter.defaultMaxListeners;
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        if (typeof console.trace === "function") {
                            console.trace();
                        }
                    }
                }
                return this;
            };
            EventEmitter.prototype.on = EventEmitter.prototype.addListener;
            EventEmitter.prototype.once = function(type, listener) {
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                var fired = false;
                function g() {
                    this.removeListener(type, g);
                    if (!fired) {
                        fired = true;
                        listener.apply(this, arguments);
                    }
                }
                g.listener = listener;
                this.on(type, g);
                return this;
            };
            EventEmitter.prototype.removeListener = function(type, listener) {
                var list, position, length, i;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[type]) return this;
                list = this._events[type];
                length = list.length;
                position = -1;
                if (list === listener || isFunction(list.listener) && list.listener === listener) {
                    delete this._events[type];
                    if (this._events.removeListener) this.emit("removeListener", type, listener);
                } else if (isObject(list)) {
                    for (i = length; i-- > 0; ) {
                        if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                            position = i;
                            break;
                        }
                    }
                    if (position < 0) return this;
                    if (list.length === 1) {
                        list.length = 0;
                        delete this._events[type];
                    } else {
                        list.splice(position, 1);
                    }
                    if (this._events.removeListener) this.emit("removeListener", type, listener);
                }
                return this;
            };
            EventEmitter.prototype.removeAllListeners = function(type) {
                var key, listeners;
                if (!this._events) return this;
                if (!this._events.removeListener) {
                    if (arguments.length === 0) this._events = {}; else if (this._events[type]) delete this._events[type];
                    return this;
                }
                if (arguments.length === 0) {
                    for (key in this._events) {
                        if (key === "removeListener") continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners("removeListener");
                    this._events = {};
                    return this;
                }
                listeners = this._events[type];
                if (isFunction(listeners)) {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
                }
                delete this._events[type];
                return this;
            };
            EventEmitter.prototype.listeners = function(type) {
                var ret;
                if (!this._events || !this._events[type]) ret = []; else if (isFunction(this._events[type])) ret = [ this._events[type] ]; else ret = this._events[type].slice();
                return ret;
            };
            EventEmitter.prototype.listenerCount = function(type) {
                if (this._events) {
                    var evlistener = this._events[type];
                    if (isFunction(evlistener)) return 1; else if (evlistener) return evlistener.length;
                }
                return 0;
            };
            EventEmitter.listenerCount = function(emitter, type) {
                return emitter.listenerCount(type);
            };
            function isFunction(arg) {
                return typeof arg === "function";
            }
            function isNumber(arg) {
                return typeof arg === "number";
            }
            function isObject(arg) {
                return typeof arg === "object" && arg !== null;
            }
            function isUndefined(arg) {
                return arg === void 0;
            }
        }, {} ],
        2: [ function(require, module, exports) {
            var UA, browser, mode, platform, ua;
            ua = navigator.userAgent.toLowerCase();
            platform = navigator.platform.toLowerCase();
            UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [ null, "unknown", 0 ];
            mode = UA[1] === "ie" && document.documentMode;
            browser = {
                name: UA[1] === "version" ? UA[3] : UA[1],
                version: mode || parseFloat(UA[1] === "opera" && UA[4] ? UA[4] : UA[2]),
                platform: {
                    name: ua.match(/ip(?:ad|od|hone)/) ? "ios" : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || [ "other" ])[0]
                }
            };
            browser[browser.name] = true;
            browser[browser.name + parseInt(browser.version, 10)] = true;
            browser.platform[browser.platform.name] = true;
            module.exports = browser;
        }, {} ],
        3: [ function(require, module, exports) {
            var EventEmitter, GIF, browser, extend = function(child, parent) {
                for (var key in parent) {
                    if (hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            }, hasProp = {}.hasOwnProperty, indexOf = [].indexOf || function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (i in this && this[i] === item) return i;
                }
                return -1;
            }, slice = [].slice;
            EventEmitter = require("events").EventEmitter;
            browser = require("./browser.coffee");
            GIF = function(superClass) {
                var defaults, frameDefaults;
                extend(GIF, superClass);
                defaults = {
                    workerScript: "gif.worker.js",
                    workers: 2,
                    repeat: 0,
                    background: "#fff",
                    quality: 10,
                    width: null,
                    height: null,
                    transparent: null,
                    debug: false,
                    dither: false
                };
                frameDefaults = {
                    delay: 500,
                    copy: false
                };
                function GIF(options) {
                    var base, key, value;
                    this.running = false;
                    this.options = {};
                    this.frames = [];
                    this.freeWorkers = [];
                    this.activeWorkers = [];
                    this.setOptions(options);
                    for (key in defaults) {
                        value = defaults[key];
                        if ((base = this.options)[key] == null) {
                            base[key] = value;
                        }
                    }
                }
                GIF.prototype.setOption = function(key, value) {
                    this.options[key] = value;
                    if (this._canvas != null && (key === "width" || key === "height")) {
                        return this._canvas[key] = value;
                    }
                };
                GIF.prototype.setOptions = function(options) {
                    var key, results, value;
                    results = [];
                    for (key in options) {
                        if (!hasProp.call(options, key)) continue;
                        value = options[key];
                        results.push(this.setOption(key, value));
                    }
                    return results;
                };
                GIF.prototype.addFrame = function(image, options) {
                    var frame, key;
                    if (options == null) {
                        options = {};
                    }
                    frame = {};
                    frame.transparent = this.options.transparent;
                    for (key in frameDefaults) {
                        frame[key] = options[key] || frameDefaults[key];
                    }
                    if (this.options.width == null) {
                        this.setOption("width", image.width);
                    }
                    if (this.options.height == null) {
                        this.setOption("height", image.height);
                    }
                    if (typeof ImageData !== "undefined" && ImageData !== null && image instanceof ImageData) {
                        frame.data = image.data;
                    } else if (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D !== null && image instanceof CanvasRenderingContext2D || typeof WebGLRenderingContext !== "undefined" && WebGLRenderingContext !== null && image instanceof WebGLRenderingContext) {
                        if (options.copy) {
                            frame.data = this.getContextData(image);
                        } else {
                            frame.context = image;
                        }
                    } else if (image.childNodes != null) {
                        if (options.copy) {
                            frame.data = this.getImageData(image);
                        } else {
                            frame.image = image;
                        }
                    } else {
                        throw new Error("Invalid image");
                    }
                    return this.frames.push(frame);
                };
                GIF.prototype.render = function() {
                    var i, j, numWorkers, ref;
                    if (this.running) {
                        throw new Error("Already running");
                    }
                    if (this.options.width == null || this.options.height == null) {
                        throw new Error("Width and height must be set prior to rendering");
                    }
                    this.running = true;
                    this.nextFrame = 0;
                    this.finishedFrames = 0;
                    this.imageParts = function() {
                        var j, ref, results;
                        results = [];
                        for (i = j = 0, ref = this.frames.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
                            results.push(null);
                        }
                        return results;
                    }.call(this);
                    numWorkers = this.spawnWorkers();
                    if (this.options.globalPalette === true) {
                        this.renderNextFrame();
                    } else {
                        for (i = j = 0, ref = numWorkers; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
                            this.renderNextFrame();
                        }
                    }
                    this.emit("start");
                    return this.emit("progress", 0);
                };
                GIF.prototype.abort = function() {
                    var worker;
                    while (true) {
                        worker = this.activeWorkers.shift();
                        if (worker == null) {
                            break;
                        }
                        this.log("killing active worker");
                        worker.terminate();
                    }
                    this.running = false;
                    return this.emit("abort");
                };
                GIF.prototype.spawnWorkers = function() {
                    var j, numWorkers, ref, results;
                    numWorkers = Math.min(this.options.workers, this.frames.length);
                    (function() {
                        results = [];
                        for (var j = ref = this.freeWorkers.length; ref <= numWorkers ? j < numWorkers : j > numWorkers; ref <= numWorkers ? j++ : j--) {
                            results.push(j);
                        }
                        return results;
                    }).apply(this).forEach(function(_this) {
                        return function(i) {
                            var worker;
                            _this.log("spawning worker " + i);
                            worker = new Worker(_this.options.workerScript);
                            worker.onmessage = function(event) {
                                _this.activeWorkers.splice(_this.activeWorkers.indexOf(worker), 1);
                                _this.freeWorkers.push(worker);
                                return _this.frameFinished(event.data);
                            };
                            return _this.freeWorkers.push(worker);
                        };
                    }(this));
                    return numWorkers;
                };
                GIF.prototype.frameFinished = function(frame) {
                    var i, j, ref;
                    this.log("frame " + frame.index + " finished - " + this.activeWorkers.length + " active");
                    this.finishedFrames++;
                    this.emit("progress", this.finishedFrames / this.frames.length);
                    this.imageParts[frame.index] = frame;
                    if (this.options.globalPalette === true) {
                        this.options.globalPalette = frame.globalPalette;
                        this.log("global palette analyzed");
                        if (this.frames.length > 2) {
                            for (i = j = 1, ref = this.freeWorkers.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
                                this.renderNextFrame();
                            }
                        }
                    }
                    if (indexOf.call(this.imageParts, null) >= 0) {
                        return this.renderNextFrame();
                    } else {
                        return this.finishRendering();
                    }
                };
                GIF.prototype.finishRendering = function() {
                    var data, frame, i, image, j, k, l, len, len1, len2, len3, offset, page, ref, ref1, ref2;
                    len = 0;
                    ref = this.imageParts;
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        frame = ref[j];
                        len += (frame.data.length - 1) * frame.pageSize + frame.cursor;
                    }
                    len += frame.pageSize - frame.cursor;
                    this.log("rendering finished - filesize " + Math.round(len / 1e3) + "kb");
                    data = new Uint8Array(len);
                    offset = 0;
                    ref1 = this.imageParts;
                    for (k = 0, len2 = ref1.length; k < len2; k++) {
                        frame = ref1[k];
                        ref2 = frame.data;
                        for (i = l = 0, len3 = ref2.length; l < len3; i = ++l) {
                            page = ref2[i];
                            data.set(page, offset);
                            if (i === frame.data.length - 1) {
                                offset += frame.cursor;
                            } else {
                                offset += frame.pageSize;
                            }
                        }
                    }
                    image = new Blob([ data ], {
                        type: "image/gif"
                    });
                    return this.emit("finished", image, data);
                };
                GIF.prototype.renderNextFrame = function() {
                    var frame, task, worker;
                    if (this.freeWorkers.length === 0) {
                        throw new Error("No free workers");
                    }
                    if (this.nextFrame >= this.frames.length) {
                        return;
                    }
                    frame = this.frames[this.nextFrame++];
                    worker = this.freeWorkers.shift();
                    task = this.getTask(frame);
                    this.log("starting frame " + (task.index + 1) + " of " + this.frames.length);
                    this.activeWorkers.push(worker);
                    return worker.postMessage(task);
                };
                GIF.prototype.getContextData = function(ctx) {
                    return ctx.getImageData(0, 0, this.options.width, this.options.height).data;
                };
                GIF.prototype.getImageData = function(image) {
                    var ctx;
                    if (this._canvas == null) {
                        this._canvas = document.createElement("canvas");
                        this._canvas.width = this.options.width;
                        this._canvas.height = this.options.height;
                    }
                    ctx = this._canvas.getContext("2d");
                    ctx.setFill = this.options.background;
                    ctx.fillRect(0, 0, this.options.width, this.options.height);
                    ctx.drawImage(image, 0, 0);
                    return this.getContextData(ctx);
                };
                GIF.prototype.getTask = function(frame) {
                    var index, task;
                    index = this.frames.indexOf(frame);
                    task = {
                        index: index,
                        last: index === this.frames.length - 1,
                        delay: frame.delay,
                        transparent: frame.transparent,
                        width: this.options.width,
                        height: this.options.height,
                        quality: this.options.quality,
                        dither: this.options.dither,
                        globalPalette: this.options.globalPalette,
                        repeat: this.options.repeat,
                        canTransfer: browser.name === "chrome"
                    };
                    if (frame.data != null) {
                        task.data = frame.data;
                    } else if (frame.context != null) {
                        task.data = this.getContextData(frame.context);
                    } else if (frame.image != null) {
                        task.data = this.getImageData(frame.image);
                    } else {
                        throw new Error("Invalid frame");
                    }
                    return task;
                };
                GIF.prototype.log = function() {
                    var args;
                    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                    if (!this.options.debug) {
                        return;
                    }
                    return console.log.apply(console, args);
                };
                return GIF;
            }(EventEmitter);
            module.exports = GIF;
        }, {
            "./browser.coffee": 2,
            events: 1
        } ]
    }, {}, [ 3 ])(3);
});

function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

/** Built-in method references without a dependency on `root`. */
var freeParseFloat = parseFloat,
  freeParseInt = parseInt;

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
? exports
: undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
? module
: undefined;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = (freeModule && freeModule.exports === freeExports)
? freeExports
: undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
* Used as a reference to the global object.
*
* The `this` value is used if it's the global object to avoid Greasemonkey's
* restricted `window` object, otherwise the `window` object is used.
*/
var root = freeGlobal ||
((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
  freeSelf || thisGlobal || Function('return this')();

if( !('gc' in window ) ) {
	window.gc = function(){}
}

if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}

// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015


// Date.now() is supported everywhere except IE8. For IE8 we use the Date.now polyfill
//   github.com/Financial-Times/polyfill-service/blob/master/polyfills/Date.now/polyfill.js
// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values

// if you want values similar to what you'd get with real perf.now, place this towards the head of the page
// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed


(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }

  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();


function pad( n ) {
	return String("0000000" + n).slice(-7);
}
// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Timers

var g_startTime = window.Date.now();

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function CCFrameEncoder( settings ) {

	var _handlers = {};

	this.settings = settings;

	this.on = function(event, handler) {

		_handlers[event] = handler;

	};

	this.emit = function(event) {

		var handler = _handlers[event];
		if (handler) {

			handler.apply(null, Array.prototype.slice.call(arguments, 1));

		}

	};

	this.filename = settings.name || guid();
	this.extension = '';
	this.mimeType = '';

}

CCFrameEncoder.prototype.start = function(){};
CCFrameEncoder.prototype.stop = function(){};
CCFrameEncoder.prototype.add = function(){};
CCFrameEncoder.prototype.save = function(){};
CCFrameEncoder.prototype.dispose = function(){};
CCFrameEncoder.prototype.safeToProceed = function(){ return true; };
CCFrameEncoder.prototype.step = function() { console.log( 'Step not set!' ) }

// function CCTarEncoder( settings ) {

//   CCFrameEncoder.call( this, settings );

//   this.extension = '.tar'
//   this.mimeType = 'application/x-tar'
//   this.fileExtension = '';
//   this.baseFilename = this.filename;

//   this.tape = null
//   this.count = 0;
//   this.part = 1;
//   this.frames = 0;

// }

// CCTarEncoder.prototype = Object.create( CCFrameEncoder.prototype );

// CCTarEncoder.prototype.start = function(){

//   this.dispose();

// };

// CCTarEncoder.prototype.add = function( blob ) {

//   var fileReader = new FileReader();
//   fileReader.onload = function() {
//     this.tape.append( pad( this.count ) + this.fileExtension, new Uint8Array( fileReader.result ) );

//     if( this.settings.autoSaveTime > 0 && ( this.frames / this.settings.framerate ) >= this.settings.autoSaveTime ) {
//       this.save( function( blob ) {
//         this.filename = this.baseFilename + '-part-' + pad( this.part );
//         download( blob, this.filename + this.extension, this.mimeType );
//         var count = this.count;
//         this.dispose();
//         this.count = count+1;
//         this.part++;
//         this.filename = this.baseFilename + '-part-' + pad( this.part );
//         this.frames = 0;
//         this.step();
//       }.bind( this ) )
//     } else {
//       this.count++;
//       this.frames++;
//       this.step();
//     }

//   }.bind( this );
//   fileReader.readAsArrayBuffer(blob);

// }

// CCTarEncoder.prototype.save = function( callback ) {

//   callback( this.tape.save() );

// }

// CCTarEncoder.prototype.dispose = function() {

//   this.tape = new Tar();
//   this.count = 0;

// }

// function CCPNGEncoder( settings ) {

// 	CCTarEncoder.call( this, settings );

// 	this.type = 'image/png';
// 	this.fileExtension = '.png';

// }

// CCPNGEncoder.prototype = Object.create( CCTarEncoder.prototype );

// CCPNGEncoder.prototype.add = function( canvas ) {

// 	canvas.toBlob( function( blob ) {
// 		CCTarEncoder.prototype.add.call( this, blob );
// 	}.bind( this ), this.type )

// }

// function CCJPEGEncoder( settings ) {

// 	CCTarEncoder.call( this, settings );

// 	this.type = 'image/jpeg';
// 	this.fileExtension = '.jpg';
// 	this.quality = ( settings.quality / 100 ) || .8;

// }

// CCJPEGEncoder.prototype = Object.create( CCTarEncoder.prototype );

// CCJPEGEncoder.prototype.add = function( canvas ) {

// 	canvas.toBlob( function( blob ) {
// 		CCTarEncoder.prototype.add.call( this, blob );
// 	}.bind( this ), this.type, this.quality )

// }

/*

	WebM Encoder

*/

// function CCWebMEncoder( settings ) {

// 	var canvas = document.createElement( 'canvas' );
// 	if( canvas.toDataURL( 'image/webp' ).substr(5,10) !== 'image/webp' ){
// 		console.log( "WebP not supported - try another export format" )
// 	}

// 	CCFrameEncoder.call( this, settings );

// 	this.quality = ( settings.quality / 100 ) || .8;

// 	this.extension = '.webm'
// 	this.mimeType = 'video/webm'
// 	this.baseFilename = this.filename;
//   this.framerate = settings.framerate;

// 	this.frames = 0;
// 	this.part = 1;

//   this.videoWriter = new WebMWriter({
//     quality: this.quality,
//     fileWriter: null,
//     fd: null,
//     frameRate: this.framerate
//   });

// }

// CCWebMEncoder.prototype = Object.create( CCFrameEncoder.prototype );

// CCWebMEncoder.prototype.start = function( canvas ) {

// 	this.dispose();

// }

// CCWebMEncoder.prototype.add = function( canvas ) {

//   this.videoWriter.addFrame(canvas);

// 	if( this.settings.autoSaveTime > 0 && ( this.frames / this.settings.framerate ) >= this.settings.autoSaveTime ) {
// 		this.save( function( blob ) {
// 			this.filename = this.baseFilename + '-part-' + pad( this.part );
// 			download( blob, this.filename + this.extension, this.mimeType );
// 			this.dispose();
// 			this.part++;
// 			this.filename = this.baseFilename + '-part-' + pad( this.part );
// 			this.step();
// 		}.bind( this ) )
// 	} else {
//     this.frames++;
// 		this.step();
// 	}

// }

// CCWebMEncoder.prototype.save = function( callback ) {

//   this.videoWriter.complete().then(callback);

// }

// CCWebMEncoder.prototype.dispose = function( canvas ) {

// 	this.frames = 0;
//   this.videoWriter = new WebMWriter({
//     quality: this.quality,
//     fileWriter: null,
//     fd: null,
//     frameRate: this.framerate
//   });

// }

// function CCFFMpegServerEncoder( settings ) {

// 	CCFrameEncoder.call( this, settings );

// 	settings.quality = ( settings.quality / 100 ) || .8;

// 	this.encoder = new FFMpegServer.Video( settings );
//     this.encoder.on( 'process', function() {
//         this.emit( 'process' )
//     }.bind( this ) );
//     this.encoder.on('finished', function( url, size ) {
//         var cb = this.callback;
//         if ( cb ) {
//             this.callback = undefined;
//             cb( url, size );
//         }
//     }.bind( this ) );
//     this.encoder.on( 'progress', function( progress ) {
//         if ( this.settings.onProgress ) {
//             this.settings.onProgress( progress )
//         }
//     }.bind( this ) );
//     this.encoder.on( 'error', function( data ) {
//         alert(JSON.stringify(data, null, 2));
//     }.bind( this ) );

// }

// CCFFMpegServerEncoder.prototype = Object.create( CCFrameEncoder.prototype );

// CCFFMpegServerEncoder.prototype.start = function() {

// 	this.encoder.start( this.settings );

// };

// CCFFMpegServerEncoder.prototype.add = function( canvas ) {

// 	this.encoder.add( canvas );

// }

// CCFFMpegServerEncoder.prototype.save = function( callback ) {

//     this.callback = callback;
//     this.encoder.end();

// }

// CCFFMpegServerEncoder.prototype.safeToProceed = function() {
//     return this.encoder.safeToProceed();
// };

/*
	HTMLCanvasElement.captureStream()
*/

// function CCStreamEncoder( settings ) {

// 	CCFrameEncoder.call( this, settings );

// 	this.framerate = this.settings.framerate;
// 	this.type = 'video/webm';
// 	this.extension = '.webm';
// 	this.stream = null;
// 	this.mediaRecorder = null;
// 	this.chunks = [];

// }

// CCStreamEncoder.prototype = Object.create( CCFrameEncoder.prototype );

// CCStreamEncoder.prototype.add = function( canvas ) {

// 	if( !this.stream ) {
// 		this.stream = canvas.captureStream( this.framerate );
// 		this.mediaRecorder = new MediaRecorder( this.stream );
// 		this.mediaRecorder.start();

// 		this.mediaRecorder.ondataavailable = function(e) {
// 			this.chunks.push(e.data);
// 		}.bind( this );

// 	}
// 	this.step();

// }

// CCStreamEncoder.prototype.save = function( callback ) {

// 	this.mediaRecorder.onstop = function( e ) {
// 		var blob = new Blob( this.chunks, { 'type' : 'video/webm' });
// 		this.chunks = [];
// 		callback( blob );

// 	}.bind( this );

// 	this.mediaRecorder.stop();

// }

/*function CCGIFEncoder( settings ) {

	CCFrameEncoder.call( this );

	settings.quality = settings.quality || 6;
	this.settings = settings;

	this.encoder = new GIFEncoder();
	this.encoder.setRepeat( 1 );
  	this.encoder.setDelay( settings.step );
  	this.encoder.setQuality( 6 );
  	this.encoder.setTransparent( null );
  	this.encoder.setSize( 150, 150 );

  	this.canvas = document.createElement( 'canvas' );
  	this.ctx = this.canvas.getContext( '2d' );

}

CCGIFEncoder.prototype = Object.create( CCFrameEncoder );

CCGIFEncoder.prototype.start = function() {

	this.encoder.start();

}

CCGIFEncoder.prototype.add = function( canvas ) {

	this.canvas.width = canvas.width;
	this.canvas.height = canvas.height;
	this.ctx.drawImage( canvas, 0, 0 );
	this.encoder.addFrame( this.ctx );

	this.encoder.setSize( canvas.width, canvas.height );
	var readBuffer = new Uint8Array(canvas.width * canvas.height * 4);
	var context = canvas.getContext( 'webgl' );
	context.readPixels(0, 0, canvas.width, canvas.height, context.RGBA, context.UNSIGNED_BYTE, readBuffer);
	this.encoder.addFrame( readBuffer, true );

}

CCGIFEncoder.prototype.stop = function() {

	this.encoder.finish();

}

CCGIFEncoder.prototype.save = function( callback ) {

	var binary_gif = this.encoder.stream().getData();

	var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
	window.location = data_url;
	return;

	var blob = new Blob( [ binary_gif ], { type: "octet/stream" } );
	var url = window.URL.createObjectURL( blob );
	callback( url );

}*/

function CCGIFEncoder( settings ) {

	CCFrameEncoder.call( this, settings );

	settings.quality = 31 - ( ( settings.quality * 30 / 100 ) || 10 );
	settings.workers = settings.workers || 4;

	this.extension = '.gif'
	this.mimeType = 'image/gif'

  	this.canvas = document.createElement( 'canvas' );
  	this.ctx = this.canvas.getContext( '2d' );
  	this.sizeSet = false;

	console.log("in GifEncoder");
	console.log(GIF)
  	this.encoder = new GIF({
		workers: settings.workers,
		quality: settings.quality,
		workerScript: settings.workersPath + 'gif.worker.js'
	} );

    this.encoder.on( 'progress', function( progress ) {
        if ( this.settings.onProgress ) {
            this.settings.onProgress( progress )
        }
    }.bind( this ) );

    this.encoder.on('finished', function( blob ) {
        var cb = this.callback;
        if ( cb ) {
            this.callback = undefined;
            cb( blob );
        }
    }.bind( this ) );

}

CCGIFEncoder.prototype = Object.create( CCFrameEncoder.prototype );

CCGIFEncoder.prototype.add = function( canvas ) {

	if( !this.sizeSet ) {
		this.encoder.setOption( 'width',canvas.width );
		this.encoder.setOption( 'height',canvas.height );
		this.sizeSet = true;
	}

	this.canvas.width = canvas.width;
	this.canvas.height = canvas.height;
	this.ctx.drawImage( canvas, 0, 0 );

	this.encoder.addFrame( this.ctx, { copy: true, delay: this.settings.step } );
	this.step();

	/*this.encoder.setSize( canvas.width, canvas.height );
	var readBuffer = new Uint8Array(canvas.width * canvas.height * 4);
	var context = canvas.getContext( 'webgl' );
	context.readPixels(0, 0, canvas.width, canvas.height, context.RGBA, context.UNSIGNED_BYTE, readBuffer);
	this.encoder.addFrame( readBuffer, true );*/

}

CCGIFEncoder.prototype.save = function( callback ) {

    this.callback = callback;

	this.encoder.render();

}

function CCapture( settings ) {

	var _settings = settings || {},
		_date = new Date(),
		_verbose,
		_display,
		_time,
		_startTime,
		_performanceTime,
		_performanceStartTime,
		_step,
        _encoder,
		_timeouts = [],
		_intervals = [],
		_frameCount = 0,
		_intermediateFrameCount = 0,
		_lastFrame = null,
		_requestAnimationFrameCallbacks = [],
		_capturing = false,
        _handlers = {};

	_settings.framerate = _settings.framerate || 60;
	_settings.motionBlurFrames = 2 * ( _settings.motionBlurFrames || 1 );
	_verbose = _settings.verbose || false;
	_display = _settings.display || false;
	_settings.step = 1000.0 / _settings.framerate ;
	_settings.timeLimit = _settings.timeLimit || 0;
	_settings.frameLimit = _settings.frameLimit || 0;
	_settings.startTime = _settings.startTime || 0;

	var _timeDisplay = document.createElement( 'div' );
	_timeDisplay.style.position = 'absolute';
	_timeDisplay.style.left = _timeDisplay.style.top = 0
	_timeDisplay.style.backgroundColor = 'black';
	_timeDisplay.style.fontFamily = 'monospace'
	_timeDisplay.style.fontSize = '11px'
	_timeDisplay.style.padding = '5px'
	_timeDisplay.style.color = 'red';
	_timeDisplay.style.zIndex = 100000
	if( _settings.display ) document.body.appendChild( _timeDisplay );

	var canvasMotionBlur = document.createElement( 'canvas' );
	var ctxMotionBlur = canvasMotionBlur.getContext( '2d' );
	var bufferMotionBlur;
	var imageData;

	_log( 'Step is set to ' + _settings.step + 'ms' );

    var _encoders = {
		gif: CCGIFEncoder,
    };

	var ctor = _encoders[ _settings.format ];
	if ( !ctor ) {
		throw "Error: Incorrect or missing format: Valid formats are " + Object.keys(_encoders).join(", ");
	}
	_encoder = new ctor( _settings );
	_encoder.step = _step

	_encoder.on('process', _process);
	_encoder.on('progress', _progress);

    if ("performance" in window == false) {
    	window.performance = {};
    }

	Date.now = (Date.now || function () {  // thanks IE8
		return new Date().getTime();
	});

	if ("now" in window.performance == false){

		var nowOffset = Date.now();

		if (performance.timing && performance.timing.navigationStart){
			nowOffset = performance.timing.navigationStart
		}

		window.performance.now = function now(){
			return Date.now() - nowOffset;
		}
	}

	var _oldSetTimeout = window.setTimeout,
		_oldSetInterval = window.setInterval,
	    	_oldClearInterval = window.clearInterval,
		_oldClearTimeout = window.clearTimeout,
		_oldRequestAnimationFrame = window.requestAnimationFrame,
		_oldNow = window.Date.now,
		_oldPerformanceNow = window.performance.now,
		_oldGetTime = window.Date.prototype.getTime;
	// Date.prototype._oldGetTime = Date.prototype.getTime;

	var media = [];

	function _init() {

		_log( 'Capturer start' );

		_startTime = window.Date.now();
		_time = _startTime + _settings.startTime;
		_performanceStartTime = window.performance.now();
		_performanceTime = _performanceStartTime + _settings.startTime;

		window.Date.prototype.getTime = function(){
			return _time;
		};
		window.Date.now = function() {
			return _time;
		};

		window.setTimeout = function( callback, time ) {
			var t = {
				callback: callback,
				time: time,
				triggerTime: _time + time
			};
			_timeouts.push( t );
			_log( 'Timeout set to ' + t.time );
            return t;
		};
		window.clearTimeout = function( id ) {
			for( var j = 0; j < _timeouts.length; j++ ) {
				if( _timeouts[ j ] == id ) {
					_timeouts.splice( j, 1 );
					_log( 'Timeout cleared' );
					continue;
				}
			}
		};
		window.setInterval = function( callback, time ) {
			var t = {
				callback: callback,
				time: time,
				triggerTime: _time + time
			};
			_intervals.push( t );
			_log( 'Interval set to ' + t.time );
			return t;
		};
		window.clearInterval = function( id ) {
			_log( 'clear Interval' );
			return null;
		};
		window.requestAnimationFrame = function( callback ) {
			_requestAnimationFrameCallbacks.push( callback );
		};
		window.performance.now = function(){
			return _performanceTime;
		};

		function hookCurrentTime() { 
			if( !this._hooked ) {
				this._hooked = true;
				this._hookedTime = this.currentTime || 0;
				this.pause();
				media.push( this );
			}
			return this._hookedTime + _settings.startTime;
		};

		try {
			Object.defineProperty( HTMLVideoElement.prototype, 'currentTime', { get: hookCurrentTime } )
			Object.defineProperty( HTMLAudioElement.prototype, 'currentTime', { get: hookCurrentTime } )
		} catch (err) {
			_log(err);
		}

	}

	function _start() {
		_init();
		_encoder.start();
		_capturing = true;
	}

	function _stop() {
		_capturing = false;
		_encoder.stop();
		_destroy();
	}

	function _call( fn, p ) {
		_oldSetTimeout( fn, 0, p );
	}

	function _step() {
		//_oldRequestAnimationFrame( _process );
		_call( _process );
	}

	function _destroy() {
		_log( 'Capturer stop' );
		window.setTimeout = _oldSetTimeout;
		window.setInterval = _oldSetInterval;
		window.clearInterval = _oldClearInterval;
		window.clearTimeout = _oldClearTimeout;
		window.requestAnimationFrame = _oldRequestAnimationFrame;
		window.Date.prototype.getTime = _oldGetTime;
		window.Date.now = _oldNow;
		window.performance.now = _oldPerformanceNow;
	}

	function _updateTime() {
		var seconds = _frameCount / _settings.framerate;
		if( ( _settings.frameLimit && _frameCount >= _settings.frameLimit ) || ( _settings.timeLimit && seconds >= _settings.timeLimit ) ) {
			_stop();
			_save();
		}
		var d = new Date( null );
		d.setSeconds( seconds );
		if( _settings.motionBlurFrames > 2 ) {
			_timeDisplay.textContent = 'CCapture ' + _settings.format + ' | ' + _frameCount + ' frames (' + _intermediateFrameCount + ' inter) | ' +  d.toISOString().substr( 11, 8 );
		} else {
			_timeDisplay.textContent = 'CCapture ' + _settings.format + ' | ' + _frameCount + ' frames | ' +  d.toISOString().substr( 11, 8 );
		}
	}

	function _checkFrame( canvas ) {

		if( canvasMotionBlur.width !== canvas.width || canvasMotionBlur.height !== canvas.height ) {
			canvasMotionBlur.width = canvas.width;
			canvasMotionBlur.height = canvas.height;
			bufferMotionBlur = new Uint16Array( canvasMotionBlur.height * canvasMotionBlur.width * 4 );
			ctxMotionBlur.fillStyle = '#0'
			ctxMotionBlur.fillRect( 0, 0, canvasMotionBlur.width, canvasMotionBlur.height );
		}

	}

	function _blendFrame( canvas ) {

		//_log( 'Intermediate Frame: ' + _intermediateFrameCount );

		ctxMotionBlur.drawImage( canvas, 0, 0 );
		imageData = ctxMotionBlur.getImageData( 0, 0, canvasMotionBlur.width, canvasMotionBlur.height );
		for( var j = 0; j < bufferMotionBlur.length; j+= 4 ) {
			bufferMotionBlur[ j ] += imageData.data[ j ];
			bufferMotionBlur[ j + 1 ] += imageData.data[ j + 1 ];
			bufferMotionBlur[ j + 2 ] += imageData.data[ j + 2 ];
		}
		_intermediateFrameCount++;

	}

	function _saveFrame(){

		var data = imageData.data;
		for( var j = 0; j < bufferMotionBlur.length; j+= 4 ) {
			data[ j ] = bufferMotionBlur[ j ] * 2 / _settings.motionBlurFrames;
			data[ j + 1 ] = bufferMotionBlur[ j + 1 ] * 2 / _settings.motionBlurFrames;
			data[ j + 2 ] = bufferMotionBlur[ j + 2 ] * 2 / _settings.motionBlurFrames;
		}
		ctxMotionBlur.putImageData( imageData, 0, 0 );
		_encoder.add( canvasMotionBlur );
		_frameCount++;
		_intermediateFrameCount = 0;
		_log( 'Full MB Frame! ' + _frameCount + ' ' +  _time );
		for( var j = 0; j < bufferMotionBlur.length; j+= 4 ) {
			bufferMotionBlur[ j ] = 0;
			bufferMotionBlur[ j + 1 ] = 0;
			bufferMotionBlur[ j + 2 ] = 0;
		}
		gc();

	}

	function _capture( canvas ) {

		if( _capturing ) {

			if( _settings.motionBlurFrames > 2 ) {

				_checkFrame( canvas );
				_blendFrame( canvas );

				if( _intermediateFrameCount >= .5 * _settings.motionBlurFrames ) {
					_saveFrame();
				} else {
					_step();
				}

			} else {
				_encoder.add( canvas );
				_frameCount++;
				_log( 'Full Frame! ' + _frameCount );
			}

		}

	}

	function _process() {

		var step = 1000 / _settings.framerate;
		var dt = ( _frameCount + _intermediateFrameCount / _settings.motionBlurFrames ) * step;

		_time = _startTime + dt;
		_performanceTime = _performanceStartTime + dt;

		media.forEach( function( v ) {
			v._hookedTime = dt / 1000;
		} );

		_updateTime();
		_log( 'Frame: ' + _frameCount + ' ' + _intermediateFrameCount );

		for( var j = 0; j < _timeouts.length; j++ ) {
			if( _time >= _timeouts[ j ].triggerTime ) {
				_call( _timeouts[ j ].callback )
				//console.log( 'timeout!' );
				_timeouts.splice( j, 1 );
				continue;
			}
		}

		for( var j = 0; j < _intervals.length; j++ ) {
			if( _time >= _intervals[ j ].triggerTime ) {
				_call( _intervals[ j ].callback );
				_intervals[ j ].triggerTime += _intervals[ j ].time;
				//console.log( 'interval!' );
				continue;
			}
		}

		_requestAnimationFrameCallbacks.forEach( function( cb ) {
     		_call( cb, _time - g_startTime );
        } );
        _requestAnimationFrameCallbacks = [];

	}

	function _save( callback ) {

		if( !callback ) {
			callback = function( blob ) {
				download( blob, _encoder.filename + _encoder.extension, _encoder.mimeType );
				return false;
			}
		}
		_encoder.save( callback );

	}

	function _log( message ) {
		if( _verbose ) console.log( message );
	}

    function _on( event, handler ) {

        _handlers[event] = handler;

    }

    function _emit( event ) {

        var handler = _handlers[event];
        if ( handler ) {

            handler.apply( null, Array.prototype.slice.call( arguments, 1 ) );

        }

    }

    function _progress( progress ) {

        _emit( 'progress', progress );

    }

	return {
		start: _start,
		capture: _capture,
		stop: _stop,
		save: _save,
        on: _on
	}
}
var GIF = freeModule.exports;

(freeWindow || freeSelf || {}).CCapture = CCapture;

  // Some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
    	return CCapture;
    });
}
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js.
    if (moduleExports) {
    	(freeModule.exports = CCapture).CCapture = CCapture;
    }
    // Export for CommonJS support.
    freeExports.CCapture = CCapture;
}
else {
    // Export to the global object.
    root.CCapture = CCapture;
}

}());
