/**
 * @author：龚意
 * @version：v0.0.1
 * 创建日期：2018/1/11
 * 历史修订：
 */
;
(function (factory) {

    // 如果要兼容 CMD 等其他标准，可以在下面添加条件，比如：
    // CMD: typeof define === 'function' && define.cmd
    // UMD: typeof exports === 'object'
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else {
        factory(jQuery || Zepto);
        // 如果要兼容 Zepto，可以改写，比如使用：factory(jQuery||Zepto)
    }
}(function ($) {
    'use strict';
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            }
        );
    }
    window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
    /**     * 定义插件的构造方法     * @param element 选择器对象     * @param options 配置项     * @constructor     */
    var Plugin = function (element, options) {

        //合并参数设置
        this.options = $.extend({}, Plugin.defaults, options);

        //将选择器对象赋值给插件，方便后续调用
        this.$element = $(element);

        //进行一些初始化工作
        this.init();
    };

    /**     * 插件名称，即调用时的名称（$.fn.pluginName）     * @type {string}     */
    Plugin.pluginName = "upvote";

    /**     * 插件缓存名称，插件通过 data 方法缓存在 dom 结构里，存储数据的名称     * @type {string}     */
    Plugin.dataName = "upvoteData";

    /**     * 插件版本     * @type {string}     */
    Plugin.version = "1.0.0";

    /**     * 插件默认配置项     * @type {{}}     */
    Plugin.defaults = {
        width: 400,//canvas高度
        height: 400,//canvas宽度
        scale:0.35,
    };

    /**     * 定义插件的方法     * @type {{}}     */
    Plugin.prototype = {
        init: function () {
            this.generateEmojiArray();
        },
        /**
         * 生成点赞需要的所有表情img数组
         */
        generateEmojiArray: function () {
            var _this = this;
            _this.emojiList = [];
            _this.emojiSelect = [];
            _this.levelList=[];
            _this.numList=[];
            var promiseAll = [];
            for (var i = 0; i < 78; i++) {
                var p = this.loadImage(this.getEmojiPath() + '/img/emoji_' + (i + 1) + '.png',i)
                    .then(function (img) {
                        _this.emojiList[img.index]=img.img;
                    });
                promiseAll.push(p);
            }
            for (var i = 0; i < 3; i++) {
                var p = this.loadImage(this.getEmojiPath() + '/img/level_' + (i + 1) + '.png',i)
                    .then(function (img) {
                        _this.levelList[img.index]=img.img;
                    });
                promiseAll.push(p);
            }
            for (var i = 0; i < 10; i++) {
                var p = this.loadImage(this.getEmojiPath() + '/img/num_' + (i + 1) + '.png',i)
                    .then(function (img) {
                        _this.numList[img.index]=img.img;
                    });
                promiseAll.push(p);
            }

            Promise.all(promiseAll).then(function () {
                _this.drawContent();
            });
        },
        /**
         * 获取当前文件的路径
         * @returns {*}
         */
        getEmojiPath: function () {
            var js = document.scripts;
            var jsPath;
            for (var i = js.length; i > 0; i--) {
                if (js[i - 1].src.indexOf("upvote.js") > -1) {
                    jsPath = js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/") + 1);
                }
            }
            return jsPath;
        },
        /**
         * 异步加载图片函数
         * @param url
         * @returns {Promise}
         */
        loadImage: function (url,i) {
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve({img:img,index:i})
                };
                img.onerror = reject;
                img.src = url;
            })
        },
        /**
         * 初始化画布
         */
        drawContent: function () {
            this.$canvas = $("<canvas></canvas>");
            this.$btn = $("<div class='btn-upvote'></div>");
            this.$canvas[0].setAttribute("width", this.options.width + "px");
            this.$canvas[0].setAttribute("height", this.options.height + "px");
            this.$canvas.css({
                position: 'absolute',
                zIndex: 9999,
                left: '50%',
                marginLeft: -this.options.width / 2 + 'px',
                bottom: -(this.options.height - this.$element.height()) / 2 + 'px'
            });
            this.$btn.css({
                position: 'absolute',
                zIndex: 10000,
                top: 0,
                left: 0
            });
            this.$element.append(this.$canvas);
            this.$element.append(this.$btn);
            this.ctx = this.$canvas[0].getContext("2d");
            this.count = 0;
            var _this = this;
            var startTime = 0;
            var endTime = 0;
            var timeOutTimer = null;
            var intervalTimer = null;
            _this.startUpvote();
            this.$btn.on("mousedown touchstart",function () {
                startTime = new Date().getTime();
                if (!timeOutTimer) {
                    _this.makeRandomEmoji();
                    timeOutTimer = setTimeout(function () {
                        intervalTimer = setInterval(function () {
                            _this.makeRandomEmoji();
                            _this.count++;
                        }, 160)
                    }, 0)
                }
            });
            this.$btn.on("mouseup touchend",function () {
                endTime = new Date().getTime();
                if (intervalTimer) {
                    if (endTime - startTime < 160) {
                        _this.count++;
                    }
                    clearInterval(intervalTimer);
                    intervalTimer = null;
                    if (timeOutTimer) {
                        clearTimeout(timeOutTimer);
                        timeOutTimer = null;
                    }
                }
            });
        },
        /**
         * 点赞开始
         */
        startUpvote: function () {
            var _this = this;
            _this.ctx.clearRect(0, 0, _this.$canvas[0].width, _this.$canvas[0].height);
            if (this.emojiSelect.length === 0) {
                _this.count = 0;
            }
            var ge = _this.count % 10;
            var shi = (_this.count-ge) % 100 / 10;
            var bai = (_this.count-shi*10-ge) % 1000 / 100;
            if(_this.count>=1000){
                ge=9;
                shi=9;
                bai=9;
            }
            var baiImg=_this.numList[bai];
            var shiImg=_this.numList[shi];
            var geImg=_this.numList[ge];
            var levelImg=null;
            if(_this.count<= 3){
                levelImg=_this.levelList[0]
            } else if(_this.count<= 6){
                levelImg=_this.levelList[1]
            }else{
                levelImg=_this.levelList[2]
            }
            var levelPosition={
                x: (this.options.width) / 2-60,
                y: (this.options.height) / 2-100,
            };
            if (bai!==0){
                _this.ctx.drawImage(baiImg, 0, 0, baiImg.width, baiImg.height,levelPosition.x,levelPosition.y,baiImg.width*0.7 , baiImg.height*0.7);
                _this.ctx.drawImage(shiImg, 0, 0, shiImg.width, shiImg.height,levelPosition.x+baiImg.width*0.7,levelPosition.y,shiImg.width*0.7 , shiImg.height*0.7);
                _this.ctx.drawImage(geImg, 0, 0, geImg.width, geImg.height,levelPosition.x+(baiImg.width+shiImg.width)*0.7,levelPosition.y,geImg.width*0.7 , geImg.height*0.7);
                _this.ctx.drawImage(levelImg, 0, 0, levelImg.width, levelImg.height,levelPosition.x+(baiImg.width+shiImg.width+geImg.width)*0.7,levelPosition.y-17,levelImg.width*0.7 , levelImg.height*0.7);
            }else if(shi!==0){
                _this.ctx.drawImage(shiImg, 0, 0, shiImg.width, shiImg.height,levelPosition.x,levelPosition.y,shiImg.width*0.7 , shiImg.height*0.7);
                _this.ctx.drawImage(geImg, 0, 0, geImg.width, geImg.height,levelPosition.x+shiImg.width*0.7,levelPosition.y,geImg.width*0.7 , geImg.height*0.7);
                _this.ctx.drawImage(levelImg, 0, 0, levelImg.width, levelImg.height,levelPosition.x+(shiImg.width+geImg.width)*0.7,levelPosition.y-17,levelImg.width *0.7, levelImg.height*0.7);
            }else if(ge!==0){
                _this.ctx.drawImage(geImg, 0, 0, geImg.width, geImg.height,levelPosition.x,levelPosition.y,geImg.width*0.7 , geImg.height*0.7);
                _this.ctx.drawImage(levelImg, 0, 0, levelImg.width, levelImg.height,levelPosition.x+geImg.width*0.7,levelPosition.y-17,levelImg.width*0.7 , levelImg.height*0.7);
            }

            this.emojiSelect.forEach(function (val, index) {
                var img = val.source;
                _this.ctx.globalAlpha = val.alphaRange;
                _this.ctx.drawImage(img, 0, 0, img.width, img.height, val.curPosition.x, val.curPosition.y, img.width * _this.options.scale, img.height * _this.options.scale);
                _this.emojiSelect[index].t += 0.02;
                _this.emojiSelect[index].rotate += 20;
                _this.emojiSelect[index].alphaRange = _this.emojiSelect[index].alphaRange - 0.01;
                var curPoint = _this.drawCurvePath([val.startPosition.x, val.startPosition.y], [val.endPosition.x, val.endPosition.y], val.curveness, val.t);
                _this.emojiSelect[index].curPosition.x = curPoint.x;
                _this.emojiSelect[index].curPosition.y = curPoint.y;
                if (val.alphaRange <= 0) {
                    _this.emojiSelect.splice(index, 1);
                }
            });
            requestAnimationFrame(_this.startUpvote.bind(_this));
        },
        /**
         * 78张图片 随机选9张emoji表情加入到渲染队列中
         */
        makeRandomEmoji: function () {
            for (var i = 0; i < 8; i++) {
                var random = Math.floor(Math.random() * this.emojiList.length);
                var emojiObj = {};
                emojiObj.source = this.emojiList[random];
                emojiObj.rotate = 0;
                emojiObj.t = 0;
                emojiObj.curPosition = {
                    x: (this.options.width - emojiObj.source.width * this.options.scale) / 2,
                    y: (this.options.height - emojiObj.source.height * this.options.scale) / 2,
                };
                emojiObj.startPosition = {
                    x: (this.options.width - emojiObj.source.width * this.options.scale) / 2,
                    y: (this.options.height - emojiObj.source.height * this.options.scale) / 2,
                };
                // var endX=[(this.options.width/5*2)*Math.random(),(this.options.width/5*2)*Math.random()+this.options.width/5*3][Math.floor(Math.random()*2)];
                emojiObj.endPosition = {
                    x: (this.options.width - emojiObj.source.width * this.options.scale) * Math.random(),
                    // x:endX,
                    y: (this.options.height - emojiObj.source.height * this.options.scale) * Math.random(),
                };
                emojiObj.curveness = Math.random();
                emojiObj.alphaRange = 1;
                this.emojiSelect.push(emojiObj);
            }
        },
        /**
         * 根据t来生成图片位置
         * @param start：开始点
         * @param end：结束点
         * @param curveness：曲度(0-1)
         * @param t:时间轴float 0-1
         * @returns {{x: (*|number), y: (*|number)}}
         */
        drawCurvePath: function (start, end, curveness, t) {
            // var cy=(start[1]+end[1])/2*curveness;
            // var cx=this.centerLine(start,end,cy);
            // var cp1 = [
            //     start[0],
            //     0
            // ];
            // var cp2 = [
            //     end[0],
            //     0
            // ];
            var cp = [
                start[0],
                0
            ];
            var x = this.quadraticBezier(start[0], cp[0], end[0], t);
            var y = this.quadraticBezier(start[1], cp[1], end[1], t);
            //
            // var x = this.cubeBezier(start[0], cp1[0], cp2[0],end[0], t);
            // var y = this.cubeBezier(start[1], cp1[1], cp2[1], end[1],t);
            return {x: x, y: y}
        },
        // centerLine: function (start, end, y) {
        //     return (y - (end[1] + start[1]) / 2) * ((start[1] - end[1]) / (end[0] - start[0])) + ((start[0] + end[0]) / 2)
        // },
        /**
         * 二次贝赛尔曲线方程
         * @param p0 开始的数据点
         * @param p1  结束的数据点
         * @param p2 控制点
         * @param t float 0-1 时间轴
         * @returns {number}
         */
        quadraticBezier: function (p0, p1, p2, t) {
            var k = 1 - t;
            return k * k * p0 + 2 * ( 1 - t ) * t * p1 + t * t * p2;
        },
        /**
         * 三次贝赛尔曲线方程
         * @param p0
         * @param p1
         * @param p2
         * @param p3
         * @param t
         * @returns {number}
         */
        cubeBezier: function (p0, p1, p2, p3, t) {
            var k = 1 - t;
            return k * k * k * p0 + 3 * k * k * t * p1 + 3 * k * t * t * p2 + t * t * t * p3;
        }
    };

    /**     * 缓存同名插件     */
    var old = $.fn[Plugin.pluginName];

    /**     * 定义插件，扩展$.fn，为jQuery对象提供新的插件方法     * 调用方式：$.fn.pluginName()     * @param option {string/object}     */
    $.fn[Plugin.pluginName] = function (option) {
        return this.each(function () {
            var $this = $(this);

            var data = $this.data(Plugin.dataName);
            var options = typeof option == 'object' && option;

            //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
            if (!data) {
                $this.data(Plugin.dataName, (data = new Plugin(this, options)));
            }
            //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn[Plugin.pluginName].Constructor = Plugin;

    /**     * 为插件增加 noConflict 方法，在插件重名时可以释放控制权     * @returns {*}     */
    $.fn[Plugin.pluginName].noConflict = function () {
        $.fn[Plugin.pluginName] = old;
        return this
    };

    /**     * 可选：     * 通过在 dom 上定义 data-role='pluginName' 的方式，自动实例化插件，省去页面编写代码     * 在这里还可以扩展更多配置，仅仅通过 data 属性 API 就能使用插件     */
    $(document).ready(function () {
        $('[data-role="' + Plugin.pluginName + '"]').each(function () {
            var $this = $(this);
            var data = $this.data();
            $.fn[Plugin.pluginName].call($this, data);
        });
    });
}));
