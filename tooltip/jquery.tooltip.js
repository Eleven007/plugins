/**
 * tooltip控件
 * @author：龚意
 * @version：v1.0
 * 创建日期：2016-4-6
 * 历史修订：
 */

;
(function($, window, document, undefined) {
	/**
	 * @param {Object} optins 设置提示框属性
	 * @param {function} callback tooltip返回函数
	 * @param {Function} fncallback 绑定对象返回函数
	 */
	$.fn.tooltip = function(options, callback, fncallback) {
	
		//触发控件元素对象
		var $target = this;	
		//默认参数
		$.fn.tooltip.defaultOptions = {
				tiptype:"peopleinfo",//提示框类型 peopleinfo：展现人物信息
				mode: "fade", //控件出现样式 fade:淡入淡出
				event: "mouseover", //触发控件事件 mouseover:鼠标滑过触发  click ：点击触发（暂未实现）
			}
			//扩展属性
		var opts = $.extend(true, {}, $.fn.tooltip.defaultOptions, options);

		//创建tooltip html结构
		bindEvent(opts.event);
		/**
		 * 创建控件html结构
		 */
		function CreateDateUI() {
			if($("#tipContainer").length>0){
				$("#tipContainer").remove();
			}
			 //获取触发控件元素left位置
			 var x = $target.offset().left;
			 //获取触发控件元素top位置
			 var y = $target.offset().top - 180;
				$("body").append('<div id="tipContainer" style="left:' + x + 'px;top:' + y + 'px">' + '</div>');
				var str = '<div class="tipinner clearfix" id="tipinner">' +
					'<div class = "user_info" >' +
					'<img class = "user_photo" src = "" alt = "">' +
					'<div class = "user_welcome" >' +
					'<h3 class = "user_name" ></h3>' +
					'<span class = "user_level" ></span >' +
					'<span class = "level_icon" ></span>' +
					'</div>' +
					'</div>' +
					'<div class = "user_detail" >' +
					'<ul class = "clearfix" >' +
					'<li>积分 <span class = "user_integral"></span> </li >' +
					'<li>主题 <span class = "user_theme"></span> </li > ' +
					'<li>回复 <span class = "user_replay"></span> </li >' +
					'</ul>' +
					'</div> ' +
					'<div class = "user_send" ><a href = "" class = "link_send" id="send_email"><span class = "Mail_logo" > </span>私信ta</a> </div > </div> <i> </i> ';
				$("#tipContainer").hide();
				$("#tipContainer").html(str);
				if(opts.tiptype=="peopleinfo"){
					$("#tipContainer .user_integral").text($target.data("integral"));
					$("#tipContainer .user_name").text($target.data("name"));
					$("#tipContainer .user_level").text("lv."+$target.data("level"));
					$("#tipContainer .level_icon").css({
						'background-image':'url('+$target.data("levelicon")+')'
					});
					$("#tipContainer .user_theme").text($target.data("subjectcount"));
					$("#tipContainer .user_replay").text($target.data("commnetcount"));
					$("#tipContainer .user_photo").attr("src",$target.data("usericon"));
				}
				$("#tipContainer").mouseleave(function(event) {
					//判断是否是触发元素
					if ( event.toElement == $target[0]) {
						
					} else {
						$("#tipContainer").fadeOut();
						$("#tipContainer").remove();
					}
				});
				$("#send_email").click(function(e){
					e.preventDefault();
					//关闭容器
					$("#tipContainer").css("display","none");
					//执行click事件
				    callback($target.attr("id"),$target.data("name"));
				});
		}
		/**
		 * 绑定事件
		 * @param {Object} evenMode：tooltip 
		 */
		function bindEvent(evenMode) {
			if (evenMode == "mouseover") {
				$target.mouseenter(function(event) {
					if(event.fromElement.parentNode!=$("#tipContainer")[0]){
					   if(opts.tiptype=="peopleinfo"&&$target.data("name")==undefined){
						getMemberinfo($target.attr("id"));
					   }
					   else{
						   CreateDateUI();  
						   if (opts.mode = "fade") {
								$("#tipContainer").fadeIn();
							} 
					   }
					}
				}).mouseleave(function(event) {
					//鼠标X坐标
					var mouse_x = event.pageX;
					//鼠标Y坐标
					var mouse_y = event.pageY;
					//容器X坐标
					var cont_x = $("#tipContainer").offset().left;
					//容器Y坐标
					var cont_y = $("#tipContainer").offset().top;
					//容器宽度
					var cont_width = $("#tipContainer").width();
					//容器高度
					var cont_heigth = $("#tipContainer").height();
					//判断鼠标是否在控件容器内
					if (cont_x-10 <= mouse_x && mouse_x <= (cont_x + cont_width+10) && cont_y-10< mouse_y && mouse_y < (cont_y + cont_heigth)) {
					} else {
						$("#tipContainer").fadeOut();
						$("#tipContainer").remove();
					}
				});
			}
		}
		function getMemberinfo(user_id){
			//获取用户信息
			mayn.bbs.getPeopleInfor(user_id,function(json){
				if(json!=null&&json!=undefined){
					$target.attr("data-name",json.peopleName==undefined?json.peopleUserNickName:json.peopleName);
					$target.attr("data-usericon",json.peopleUserIcon);
				}
				//获取用户积分值及等级
				mayn.bbs.getPeopleGroupBypeopleId(user_id,function(json){
					if(json!=null&&json!=undefined){
						$target.attr("data-integral",json.peopleScore[0].peopleScoreTotalScore);
						$target.attr("data-level",json.peopleGroup.categorySort);
						$target.attr("data-levelicon",json.peopleGroup.categorySmallImg);
						}
					//获取用户发布帖子,回复帖子等数据的总数
					mayn.bbs.getPeopleCount(user_id,function(json){
						if(json!=null&&json!=undefined){
							$target.attr("data-subjectcount",json.subjectCount);
							$target.attr("data-commnetcount",json.commnetCount);	
						}
						 CreateDateUI();  
						   if (opts.mode = "fade") {
								$("#tipContainer").fadeIn();
							} 
					});
				});
			});
		}
	}
}(jQuery, window, document));