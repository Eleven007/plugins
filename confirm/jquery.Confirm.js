/*
 * 使用说明:
 * window.wxc.Pop(popHtml, [type], [options])
 * popHtml:html字符串
 * type:window.wxc.xcConfirm.typeEnum集合中的元素
 * options:扩展对象
 */
(function($) {
	window.wxc = window.wxc || {};
	window.wxc.xcConfirm = function(type, options) {
		// 返回信息
		var callbackinfo = "";
		//
		// 按钮类型
		var btnType = window.wxc.xcConfirm.btnEnum;
		// 事件类型
		var eventType = window.wxc.xcConfirm.eventEnum;
		var popType = {
			info: {
				title: "信息",
				icon: "0 0", // 蓝色i
				btn: btnType.ok
			},
			success: {
				title: "成功",
				icon: "0 -48px", // 绿色对勾
				btn: btnType.ok
			},
			error: {
				title: "错误",
				icon: "-48px -48px", // 红色叉
				btn: btnType.ok
			},
			confirm: {
				title: "提示",
				icon: "-48px 0", // 黄色问号
				btn: btnType.okcancel
			},
			warning: {
				title: "警告",
				icon: "0 -96px", // 黄色叹号
				btn: btnType.okcancel
			},
			input: {
				title: "输入",
				icon: "",
				btn: btnType.ok
			},
			custom: {
				title: "",
				icon: "",
				btn: btnType.ok
			}
		};
		var itype = type ? type instanceof Object ? type : popType[type] || {} : {}; // 格式化输入的参数:弹窗类型
		// 默认文本框内容为发送私信内容(长度限制为300)
		var UCeditor = '<script id="UCeditor" name="subjectContent" type="text/plain"></script>';
		//编辑器对象
		var UEobj = "";
		var default_pophtml = '<div class="tobox"> <p class = "tosend" > 发给: </p> <p class = "to_user" ></p> </div> <div class = "txtcontent" ><p class = "dd" > 内容 </p>' + UCeditor + '</div>';
		var config = $.extend(true, {
			// 自定义的标题
			title: "发私信",
			// 收信人名字
			toName: "",
			// 自定义文本框内容
			pophtml: default_pophtml,
			// 字数限制 默认为300 只有弹出框中有编辑器时设置 ""时不限制字数
			wordlimit: 300,
			//编辑器serverurl地址
			host:"",
			// 图标
			icon: "",
			// 按钮,默认单按钮
			btn: btnType.ok,
			// 点击确定的按钮回调
			onOk: $.noop,
			// 点击取消的按钮回调
			onCancel: $.noop,
			// 弹窗关闭的回调,返回触发事件
			onClose: $.noop
		}, itype, options);

		// 标题
		var $tt = $("<span>").addClass("tt").text(config.title);
		// 图标
		var icon = config.icon;
		var $icon = icon ? $("<div>").addClass("bigIcon").css(
			"backgroundPosition", icon) : "";
		// 按钮组生成参数
		var btn = config.btn;
		// 弹窗索引
		var popId = creatPopId();
		// 弹窗插件容器
		var $box = $("<div>").addClass("xcConfirm");
		// 遮罩层
		var $layer = $("<div>").addClass("xc_layer");
		// 弹窗盒子
		var $popBox = $("<div>").addClass("popBox");
		// 弹窗顶部区域
		var $ttBox = $("<div>").addClass("ttBox");
		// 弹窗内容主体区
		var $txtBox = $("<div>").addClass("txtBox");
		// 按钮区域
		var $btnArea = $("<div>").addClass("btnArea").addClass("clearfix");

		var $ok = $("<button>").addClass("sgBtn").addClass("ok").text("确定"); // 确定按钮
		var $cancel = $("<a>").addClass("sgBtn").addClass("cancel").text("取消"); // 取消按钮
		var $input = $("<input>").addClass("inputBox"); // 输入框
		var $clsBtn = $("<a>").addClass("clsBtn"); // 关闭按钮

		// 建立按钮映射关系
		var btns = {
			ok: $ok,
			cancel: $cancel
		};

		init();

		function init() {
			// 处理特殊类型input
			if (popType["input"] === itype) {
				$txt.append($input);
			}

			creatDom(config.host);
			bind();
		}

		function creatDom(host) {
			$popBox.append($ttBox.append($clsBtn).append($tt)).append(
				$txtBox.append($icon).append(config.pophtml)).append(
				$btnArea.append(creatBtnGroup(btn)));
			$box.attr("id", popId).append($layer).append($popBox);
			$("body").append($box);
			if ($("#UCeditor").length > 0) {
				//初始化编辑器
				UEobj = UE.getEditor('UCeditor', {
					imageScaleEnabled: true,
					serverUrl: host+"/ueditor/dispatch.do?jsonConfig={imagePathFormat: '/upload/editor/1548/{time}{rand:6}'}", // 服务器统一请求接口路径
					toolbars: [
						['bold', 'forecolor', 'emotion', 'link', 'unlink', 'simpleupload', 'insertimage', 'insertcode', 'source']
					],
					autoHeightEnabled: true,
					autoFloatEnabled: true,
					scaleEnabled: true,
					compressSide: 0,
					maxImageSideLength: 2000,
					maximumWords: config.wordlimit,
					imageScaleEnabled: false,
					savePath: ['../../upload/editor/86/'],
				});
				UEobj.addListener("contentChange", function() {
					var count = UEobj.getContentTxt().length;
					if (count <= config.wordlimit) {
						var aaa = $ok.attr("disabled");
						if ($ok.attr("disabled") == "disabled") {
							$ok.attr("disabled",false);
							$ok.removeClass("disabled").addClass("ok");
							$(".txtlimit").css({
								color: "rgba(120, 120, 120, 0.86)"
							})
						}
						$(".txtlimit").text("还剩" + (config.wordlimit - count) + "字节");
					} else {
						$ok.attr("disabled", "disabled");
						$ok.removeClass("ok").addClass("disabled");
						$(".txtlimit").text("超出最大限制字数！").css({
							color: "red"
						});
					}
				})
			}
			$(".tobox p.to_user").text(config.toName);
		}

		function bind() {
			// 点击确认按钮
			$ok.click(doOk);
			// 点击取消按钮
			$cancel.click(doCancel);

			// 点击关闭按钮
			$clsBtn.click(doClose);
		}

		// 确认按钮事件
		function doOk() {
			var $o = $(this);
			var v = $.trim($input.val());
			if ($input.is(":visible")) {
				config.onOk(v);
				$("#" + popId).remove();	
			} else {
				if ($("#UCeditor").length > 0) {
					config.onOk(UEobj.getContentTxt(),function(){
						UEobj.destroy();
						$("#" + popId).remove();
					});
				}
			}
			config.onClose(eventType.ok);
		}

		// 取消按钮事件
		function doCancel() {
			var $o = $(this);
			config.onCancel();
			//销毁编辑器对象
			UEobj.destroy();
			$("#" + popId).remove();
			config.onClose(eventType.cancel);
		}

		// 关闭按钮事件
		function doClose() {
			//销毁编辑器对象
			UEobj.destroy();
			$("#" + popId).remove();
			config.onClose(eventType.close);
			$(window).unbind("keydown");
		}

		// 生成按钮组
		function creatBtnGroup(tp) {
			var $bgp = $("<div>").addClass("btnGroup");
			if (config.wordlimit != "") {
				var $p = $("<p>").addClass("txtlimit").text(
					"还剩" + config.wordlimit + "字节");
				$bgp.prepend($p);
			}
			$.each(btns, function(i, n) {
				if (btnType[i] == (tp & btnType[i])) {
					$bgp.append(n);
				}
			});
			return $bgp;
		}

		// 重生popId,防止id重复
		function creatPopId() {
			var i = "pop_" + (new Date()).getTime() + parseInt(Math.random() * 100000); // 弹窗索引
			if ($("#" + i).length > 0) {
				return creatPopId();
			} else {
				return i;
			}
		}
	};

	// 按钮类型
	window.wxc.xcConfirm.btnEnum = {
		ok: parseInt("0001", 2), // 确定按钮
		cancel: parseInt("0010", 2), // 取消按钮
		okcancel: parseInt("0011", 2)
			// 确定&&取消
	};

	// 触发事件类型
	window.wxc.xcConfirm.eventEnum = {
		ok: 1,
		cancel: 2,
		close: 3
	};

	// 弹窗类型
	window.wxc.xcConfirm.typeEnum = {
		info: "info",
		success: "success",
		error: "error",
		confirm: "confirm",
		warning: "warning",
		input: "input",
		custom: "custom"
	};

})(jQuery);