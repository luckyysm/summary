/**
 * Created by Administrator on 2018/4/16.
 */
var ticketCount = 0;
$(function(){
    // 全局数据存放;
    var dataBase = {
        zoomLevel:1
    }
    // 渲染数据
    var renderData = {
        priceList :function(data){
            var _dom = [];
            for (var i = 0,len = data.length; i < len; i++) {
                var item = data[i]
                _dom.push(
                    '<li>\
                        <span class="price-code" style="background-color:' + item.ticketPriceColor + '"></span>\
						<span class="price-show">￥' + item.price + '</span>\
						<span class="price-grade">' + item.priceGradeShow + '级</span>\
					</li>')
            }
            $("#renderPrice").html(_dom.join(""));
        },
        querySalePrice: function(data){
            var _dom = [];
            for (var i = 0,len = data.length; i < len; i++) {
                var item = data[i]
                _dom.push(
                    '<li>\
                        <span class="price-code" style="background-color:' + item.price_colour + '"></span>\
						<span class="price-show">￥' + item.totalprices +'('+ item.price +'*'+item.priceNum +')' + '</span>\
						<span class="price-grade">' + item.pricelevel + '级</span>\
					</li>')
            }
            $("#renderQuerySalePrice").html(_dom.join(""));
        },
        seatMap: function(data){
            var seatList = data;
            var mapSize = interaction.calcMapSize(seatList);
            var priceList = dataBase["priceList"];
            priceList.push({
                price:0,
                priceGrade:"S",
                priceGradeShow:"S",
                ticketPriceColor:"#000000",
                ticketPriceId:0
            })
            //  初始化地图数据
            var formatMap = initMapData();
            dataBase["formatMap"] = formatMap;
            //  座位类型设置
            var priceGradeSeats = getPriceGradeSeats();
            //  id所映射的座位数据
            var idMapSeat = dataBase["idMapSeat"];

            var $cart = $("#renderSeatInfo");
            var $counter = $("#seatCount");
            var $total = $("#moneyCount");
            console.log();
            var SeatMAP = $('#seatMap').seatCharts({
                map: formatMap,
                seats: priceGradeSeats,
                naming: {
                    top: false,
                    getLabel: function(character, row, column) {
                        return ""
                    }
                },
                legend: {
                    node: $('#legend'),
                    items: [
                        ['A', 'available', '头等舱'],
                        ['B', 'available', '经济舱'],
                        ['C', 'unavailable', '已预定']
                    ]
                },
                click: function(event) {

                    if (this.status() == 'available') {
                        if (SeatMAP.find('selected').length >= parseInt(ticketNumber) && parseInt(purchaseRestrictions) != 0) {
                            $counter.text(SeatMAP.find('selected').length);
                            alert("购票数量不能超过"+ticketNumber+"张");
                            return 'available';
                        }
                        var oSeat = idMapSeat[this.settings.id];
                        var sSeat = oSeat.site;
                        $('<li>\
								<div class="seat-delete">\
									<i class="iconfont icon-shanchu"></i>\
								</div>\
								<div class="seat-info">\
									<div class="seat-info-left">\
										<i class="iconfont icon-seat" style="color:'+ this.data().bgColor +'"></i>\
										<span>￥'+ this.data().price +'</span>\
									</div>\
									<div class="seat-info-right">\
										<p>座号：'+ sSeat +'</p>\
										<p>分区：'+ dataBase["cursection"] +'</p>\
										<p>楼层：'+ oSeat.sf +'</p>\
									</div>\
								</div>\
							</li>')
                            .attr('id', 'cart-item-' + this.settings.id)
                            .data('seatId', this.settings.id)
                            .appendTo($cart);
                        $counter.text(SeatMAP.find('selected').length + 1);
                        $total.text(cancleFloatNumber(recalculateTotal(SeatMAP) + this.data().price));
                        ticketCount++;
                        $(".checked-seat-info").addClass("info-show");
                        return 'selected';
                    }
                    else if (this.status() == 'selected') {
                        //update the counter
                        $counter.text(SeatMAP.find('selected').length - 1);
                        //and total
                        $total.text(cancleFloatNumber(recalculateTotal(SeatMAP) - this.data().price));
                        //remove the item from our cart
                        $('#cart-item-' + this.settings.id).remove();
                        //seat has been vacated
                        ticketCount--;
                        if ($("#moneyCount").text() == "0") {
                            $(".checked-seat-info").removeClass("info-show");
                        }
                        return 'available';
                    }
                    else if (this.status() == 'unavailable') {
                        //seat has been already booked
                        return 'unavailable';
                    } else {
                        return this.style();
                    }

                    function cancleFloatNumber(number){
                        return Math.round(number*100)/100;
                    }
                }
            });


            //  设置对应的颜色
            for(var t in priceGradeSeats){
                $("." + priceGradeSeats[t].classes).css({color:priceGradeSeats[t].bgColor})
            }
            // 设置锁定的座位
            SeatMAP.get(dataBase["soldSeat"]).status('unavailable');
            SeatMAP.get(dataBase["stage"]).status('unavailable stage');

            //  点击删除按钮
            $cart.on('click', '.seat-delete', function() {
                SeatMAP.get($(this).parents('li:first').data('seatId')).click();
            });

            // 消除恶心的焦点事件
            $(".seatCharts-cell").on("mouseenter mouseleave click",function(){
                $(this).blur();
            })

            // 设置座位容器宽度
            interaction.setSeatContainerWidth();
            // 给所有座位添加title
            interaction.setSeatTitle();
            // 飞入购物车效果
            interaction.flyerToCart();
            // 座位缩放
            interaction.zoomSeat();
            interaction.isShowInitStage();
            function getPriceGradeSeats(){
                var priceGradeSeats = {};
                for (var i = 0; i < priceList.length; i++) {
                    var price = priceList[i];
                    priceGradeSeats[price.priceGradeShow] = {
                        price: price.price,
                        classes: price.priceGradeShow + price.ticketPriceId,
                        category: price.priceGrade,
                        bgColor:price.ticketPriceColor
                    }
                }
                return priceGradeSeats;
            }
            function initMapData(){
                // 存放售卖的座位;
                dataBase["soldSeat"] = [];
                dataBase["stage"] = [];
                // 存放ID 映射(对应)的座位数据
                dataBase["idMapSeat"] = {};

                var tempArr = [];
                for (var i = 0; i < mapSize.maxY - mapSize.minY + 1; i++) {
                    var tempStr = "";
                    for (var j = 0; j < mapSize.maxX - mapSize.minX + 1; j++) {
                        tempStr += "_";
                    }
                    tempArr.push(tempStr);
                }
                for (var i = 0; i < seatList.length; i++) {
                    var x = seatList[i].x;
                    var y = seatList[i].y;
                    var priceGrade = interaction.getOnlyAppointObj(priceList, "ticketPriceId", seatList[i].pid).priceGradeShow;
                    var flagArr = tempArr[y - mapSize.minY].split("");
                    flagArr[x - mapSize.minX] = priceGrade;
                    tempArr[y - mapSize.minY] = flagArr.join("");
                    var seatMapId = (y- mapSize.minY + 1) + "_" + (x - mapSize.minX + 1);
                    // 判断是否已售
                    if (seatList[i].sst.id == 1) {
                        dataBase["soldSeat"].push(seatMapId);
                    }
                    if (seatList[i].pid == 0){
                        dataBase["stage"].push(seatMapId);
                    }
                    dataBase["idMapSeat"][seatMapId] = seatList[i];
                }
                return tempArr;
            }
            function recalculateTotal(SeatMAP) {
                var total = 0;
                //basically find every selected seat and sum its price
                SeatMAP.find('selected').each(function() {
                    total += this.data().price;
                });
                return total;
            }
        },
        svg:function(data){
            var  $rendersvg = $("#rendersvg")
            if(navigator.userAgent === "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; InfoPath.3; .NET4.0E; .NET4.0C)"){
                $("#rendersvg").css({zoom:0.3125})
                alert("你的浏览器版本过低，视觉体验可能有部分差异，建议升级高版本浏览器后再试！")
            }
            $rendersvg.html(data).find("g>title").html("");
            $rendersvg.find("g>*:not(image,title)").each(function(index,item){
                if(!$(item).attr("class")){
                    $(item).remove();
                }else{
                    var sectionId = $(item).attr("id");

                    if (sectionId == window.sectionId) {
                        $(item).attr("cursection",true);
                        dataBase["cursection"] = $(item).attr("class");
                    }
                    try{
                        if (dataBase["sectionSelectList"].indexOf(sectionId*1) == -1) {
                            $(item).css({fill:'#ccc',stroke:'#ccc',cursor:'not-allowed'})
                        }
                    }catch(e){
                        for(var i = 0,len = dataBase["sectionSelectList"].length;i<len;i++){
                            if(dataBase["sectionSelectList"][i] == sectionId*1){
                                $(item).css({fill:'#ccc',stroke:'#ccc',cursor:'not-allowed'})
                            }
                        }
                    }

                }
            })
        }
    }

    // 交互
    var interaction = {

        // 计算画布大小
        calcMapSize:function (SeatList) {
            var xArr = [];
            var yArr = [];
            for (var i = 0, len = SeatList.length; i < len; i++) {
                xArr.push(SeatList[i].x);
                yArr.push(SeatList[i].y);
            }
            xArr.sort(function(a, b) {
                return a - b
            })
            yArr.sort(function(a, b) {
                return a - b
            })
            return {
                maxX: xArr[xArr.length - 1],
                maxY: yArr[yArr.length - 1],
                minX: xArr[0],
                minY: yArr[0]
            }
        },
        //根据唯一值查找数组中指定值的对象
        getOnlyAppointObj:function (array, basis, condition) {
            if (!array instanceof Array) {
                throw new Error("Arguments[0] must be an Array");
            }
            if (typeof(basis) != "string") {
                throw new Error("Arguments[1] must be a String");
            }
            if (typeof(condition) == "object" && condition !== null) {
                throw new Error("Arguments[2] must be a Base data type");
            }
            var _length = array.length;

            for (var i = 0; i < _length; i++) {
                if (array[i][basis] == condition) {
                    return array[i];
                }
            }
            throw new Error("An object with a appoint " + basis + " of " + condition + " is not found in the array");
        },
        // 设置座位容器宽度
        setSeatContainerWidth:function (){
            var mapMaxSeatCount = dataBase["formatMap"][0].length;
            var seatWidth = $(".seatCharts-cell").outerWidth(true);
            $("#seatMap").width(mapMaxSeatCount * seatWidth);
        },
        // 设置座位容器可移动
        setSeatContainerMove:function(){
            var isFireFox = navigator.userAgent.indexOf("Firefox") > 0 ;
            $("#seatMap").mousedown(function(e){
                var x = e.pageX;
                var y = e.pageY;
                var $this = $(this);
                var left = 	parseFloat($this.css("marginLeft"));
                var top = 	parseFloat($this.css("marginTop"));
                $(this).mousemove(function(e){
                    var l = e.pageX - x;
                    var t = e.pageY - y;
                    var zoom = parseInt(this.style.zoom);
                    if(isFireFox){
                        $this.css({"marginLeft": l + left,"marginTop":t + top})
                    }else{
                        $this.css({"marginLeft": l*100/zoom + left,"marginTop":t*100/zoom + top})
                    }
                    //$this.find(".seatCharts-cell");
                    //$this.find(".seatCharts-cell").css({cursor:'move'})
                })
                $(document).mouseup(function(){
                    $this.off("mousemove");
                    //$this.off("mousemove").css({cursor:'default'});
                    // $this.find(".available").css({cursor:'pointer'});
                    // $this.find(".selected").css({cursor:'pointer'});
                    // $this.find(".unavailable").css({cursor:'not-allowed'});
                })
                $(document).mousemove(function(e){
                    window.event.returnValue = false;
                    return false;
                })
                document.body.onselectstart = document.body.ondrag = function(){
                    return false;
                }
            })
        },
        // 设置缩放等级
        setSeatSize:function(){

            $("#enlarge").click(function(){
                if (dataBase.zoomLevel < 1) {
                    dataBase.zoomLevel += 0.2;
                    calcZoomSize();
                }
            })
            $("#shrink").click(function(){
                if (dataBase.zoomLevel > 0.7) {
                    dataBase.zoomLevel -= 0.2;
                    calcZoomSize();
                }
            })
            function calcZoomSize(){
                var zoomWidth = dataBase.zoomLevel * 25;
                var rowZoomHeigth = dataBase.zoomLevel * 35;
                $(".seatCharts-row").css({height:rowZoomHeigth})
                $(".seatCharts-cell").css({width:zoomWidth,height:zoomWidth,fontSize:zoomWidth,lineHeight:zoomWidth +'px',marginRight:zoomWidth/2});
                interaction.setSeatContainerWidth();
            }
        },
        // 设置全屏事件
        setSeatContainerFullScreen:function(){
            $("#fullScreen").click(function(){
                var isFullscreen = interaction.getIsFullscreen();
                if (isFullscreen) {
                    interaction.cancleFullScreen();
                    $(".c-main").width(1200);
                    $(this).attr("title","全屏").find("i").removeClass("icon-canclefullscreen").addClass("icon-fullscreen");
                }else{
                    if (interaction.setFullScreen()) {
                        alert('该浏览器不支持全屏功能，珍爱生命，远离IE！');
                        return false;
                    }else{
                        $(".c-main").width('100%');
                        $(this).attr("title","取消全屏").find("i").removeClass("icon-fullscreen").addClass("icon-canclefullscreen");
                    }
                }
            })
        },
        // 判断是否全屏
        getIsFullscreen: function () {
            return document.fullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || false;
        },
        // 设置全屏
        setFullScreen:function(){
            var docElm = document.documentElement;
            //W3C
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
                return false;
            }
            //FireFox
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
                return false;
            }
            //Chrome等
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
                return false;
            }
            //IE11
            else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
                return false;
            }else{
                return "nonsupport";
            }
        },
        // 取消全屏
        cancleFullScreen:function(){
            var de = document;
            if (de.exitFullscreen) {
                de.exitFullscreen();
                return;
            } else if (de.mozCancelFullScreen) {
                de.mozCancelFullScreen();
                return;
            } else if (de.webkitCancelFullScreen) {
                de.webkitCancelFullScreen();
                return;
            } else if (de.msExitFullscreen) {
                de.msExitFullscreen();
            }
        },
        commitSeat:function(){
            $("#commitSeat").click(function(){
                if( interaction.judgeTicketNumber() ) return;

                // 判断是否登录
                $.ajax({
                    url : _ctx+ "/doLogin/getLoginUser",
                    data : null,
                    type : "post",
                    dataType : "json",
                    async : false,
                    cache : false,
                    success : function(data) {
                        //console.log(data)
                        // 如果已经登录
                        if(data.status){
                            interaction.createOrder();
                            // 若没有登录
                        }else{
                            loginDivShow(true);
                        }
                    }
                });
            })
        },
        createOrder:function(){
            var checkedSeatArr = [];
            var data = [];
            var price = null;
            var priceId = null;
            var seat = null;
            var param = null;
            var nowData = new Date().getTime();
            var $checkedSeat = $(".selected").not(".seat-status");
            $checkedSeat.each(function(index,item){
                var mapId = $(item).attr("id");
                var idMapSeat = dataBase['idMapSeat'][mapId];
                price= interaction.getOnlyAppointObj(dataBase['priceList'], "ticketPriceId", idMapSeat.pid).price;
                priceId = idMapSeat.pid;
                seat = idMapSeat.sid;
                param = {
                    "price": price,   //票价
                    "priceId" :priceId,      //票价Id
                    "seat":seat,          //座位ID
                    "count": "1",        //张数
                    "actuallyPrice": price,  //实际票价
                    "freeTicketCount": "1"  //套票数量
                };
                data.push(param);
                checkedSeatArr.push(dataBase['idMapSeat'][mapId])
            })
            var submitParam = {
                "data" : data,
                "param" : {
                    "theaterId" : theaterId,
                    "projectId" : projectId,
                    "projectName" : productName,
                    "date" : nowData,
                    "showId" : showId,
                    "showTime" : showTime,
                    "placeId" : placeId,
                    "venueId" : venueId,
                    "isRealName" : isRealName,
                    "sign" : sign,
                    "manageWayCode" : manageWayCode
                }
            }
            //console.log(submitParam);
            interaction.endCommit(submitParam)
            /*$.post(_ctx+"/isNotSaleClass",{'submitParam':JSON.stringify(submitParam)}).then(function(data){
             try{
             var data = JSON.parse(data).data;
             }catch(e){
             var data = eval("("+ data +")").data;
             }

             console.log(data)
             // 超出会员限购数量
             if(data.isNotMemberSaleclass == 2){
             interaction.showAlert({
             content:"会员优惠价限购"+ data.oneBuyQuan +"张，您购买的张数超过会员优惠限购张数，将无法享受会员优惠",
             success:function(){
             interaction.endCommit(submitParam)
             }
             })

             // 没有满足条件的套票政策
             }else if(data.isNotMemberSaleclass == 4 || data.isNotMemberSaleclass == 5){
             interaction.showAlert({
             content:"套票暂时只支持单独购买",
             success:function(){
             interaction.endCommit(submitParam)
             }
             })
             }else{
             interaction.endCommit(submitParam)
             }
             })  	*/
        },
        endCommit:function(data){
            debugger
//        	$.post(_ctx+"/submitOrderSeat",{'submitParam':JSON.stringify(data)}).then(function(data){
//        		console.log(data);
//
//        	})
            $("#param").val(JSON.stringify(data));
            $("#form").submit();
        },
        showAlert:function(obj){
            $("#VeryhuoCOM").show();
            $(".shadowDiv").show();
            $("#VeryhuoCOM .f16").html(obj.content);
            $("#VeryhuoCOM .asubmit").off("click");
            $("#VeryhuoCOM .asubmit").click(function(){
                obj.success && obj.success();
            })
            $("#VeryhuoCOM .closex").off("click");
            $("#VeryhuoCOM .closex").click(function(){
                $("#VeryhuoCOM").hide();
                $(".shadowDiv").hide();
            })
        },
        judgeTicketNumber:function(){
            console.log(ticketCount,ticketNumber)
            if(ticketCount==0){
                return true;
            }
//        	?? 不可能走的代码
            if(ticketCount > parseInt(ticketNumber)){
                console.log(purchaseRestrictions)
                if(parseInt(purchaseRestrictions)==parseInt(ticketNumber)){
                    alert("购买数量超出限制，本场次限购"+ticketNumber+"张");
                }else{

                    alert("购买数量超出限制，本场次您还可以再买"+ticketNumber+"张");
                }
                return true;
            }
            return false;
        },
        svgLink:function(){
            $("#rendersvg").on("dblclick","g>*:not(image,title)",function(){
                var sectionId = $(this).attr("id");

                if (dataBase["sectionSelectList"].indexOf(sectionId*1) == -1) {
                    return false;
                }
                var param = "sectionId="+sectionId+"&showId="+showId+"&placeId="+placeId+"&venueId="+venueId+"&projectId="+projectId+
                    "&showTime="+showTime+"&theaterId="+theaterId+"&productId="+productId+"&productName="+productName+"&isRealName="+isRealName+"&purchaseRestrictions="+purchaseRestrictions+
                    "&ticketNumber="+ticketNumber+"&manageWayCode="+manageWayCode+"&productTypeName="+productTypeName+"&productSubtypeName="+productSubtypeName+"&threaterName="+threaterName;
                location.href = _ctx+'/chooseSeat/getViewSkipToSeat?'+param;
            });
        },
        // 给所有座位添加title
        setSeatTitle:function(){
            $("#seatMap").find(".seatCharts-seat").each(function(index,item){
                var id = $(item).prop("id");
                var oSeat = dataBase['idMapSeat'][id] || {};
                var sSeat = oSeat.site;
                $(this).attr("title",sSeat);
            })

        },
        // 加入购物车飞入效果
        flyerToCart:function(){
            var offset = $("#renderSeatInfo").offset();
            $("#seatMap").on("click",".seatCharts-seat",function(event){
                if ( $(this).hasClass("unavailable") || $(this).hasClass("available") ) return false;
                var scrollTop = $("body").get(0).scrollTop;
                var color = this.style.color;
                var flyer = $('<i class="u-flyer iconfont icon-seat" style="color:'+ color +'"></i>');
                flyer.fly({
                    start: {
                        left: event.pageX,
                        top: event.pageY - scrollTop - 30
                    },
                    end: {
                        left: offset.left-190,
                        top: offset.top-80,
                        width: 0,
                        height: 0
                    },
                    onEnd: function(){
                        this.destory();
                    }
                });
            })
        },
        zoomSeat: function () {
            var height = $(".seat-main").height();
            var con = $(".seat-container").width();
            var main = $(".seat-main").width();
            var minZoom = Math.floor(con/main*100);
            var resultHeight = minZoom * height/100 +100;

            var isFireFox = navigator.userAgent.indexOf("Firefox") > 0 ;
            if(minZoom > 100){
                $(".seat-main")[0].style.zoom = '100%';

                if(isFireFox){
                    $(".seat-main").css({
                        "transform":"scale(1)",
                        "-moz-transform-origin":"top left"
                    })
                }
                var resultHeight = height + 100;
            }else{
                $(".seat-main")[0].style.zoom = minZoom + '%';
                if(isFireFox){
                    $(".seat-main").css({
                        "transform":"scale("+ minZoom / 100 +")",
                        "-moz-transform-origin":"top left"
                    })
                }
                var resultHeight = minZoom * height/100 +100;
            }
            $(".cm-main").height(resultHeight > 620 ? resultHeight : 620);


            $(".seat-main").on("mousewheel DOMMouseScroll", function (e) {
                var zoom = parseInt(this.style.zoom) || 100;
                zoom += e.originalEvent.wheelDelta / 120;

                if(isFireFox){
                    var scale = $(".seat-main").css("transform").match(/\d+\.?\d+/g)[0];

                    if(e.originalEvent.detail > 0 ){
                        scale = scale*100-1;
                    }else{
                        scale = scale*100+1;
                    }

                    if(scale <= Math.min(minZoom,40) ) {
                        scale = Math.min(minZoom,40)
                    };

                    $(".seat-main").css({
                        "transform":"scale("+ scale/100 +")",
                        "-moz-transform-origin":"top left"
                    })
                }


                if (zoom >= Math.min(minZoom,40) ){
                    this.style.zoom = zoom + '%';
                }
                return false;
            })
            $("#fullScreen").click(function () {
                $(".seat-main")[0].style.zoom = Math.min(minZoom,100) + '%';
                if(isFireFox){
                    $(".seat-main").css({
                        "transform":"scale("+ minZoom / 100 +")",
                        "-moz-transform-origin":"top left"
                    })
                }
                $(".seat-main").css({margin:0})
            })
            $("#shrink").click(function () {
                var seatInfo = $(".checked-seat-info");
                seatInfo.hasClass("info-show") ? seatInfo.removeClass("info-show") : seatInfo.addClass("info-show");
            })
        },
        isShowInitStage: function(){
            if(dataBase.stage.length){
                console.log('自定义舞台')
                $('.seat-show>span').hide();
            }
        }

    }


    function GetDate (){
        $.post(_ctx+"/chooseSeat/openArea",{"showId":showId,"sectionId":sectionId,"theaterId":theaterId}).then(function(data){
            try{
                var data = JSON.parse(data).data;
            }catch(e){
                var data = eval("("+ data +")").data;
                alert("您的浏览器版本过低，可能会影响您的视觉体验，请升级至最新浏览器！或按F12把文档模式修改为IE9标准以上。")
            }
            console.log(data)
            var priceListData = data.priceList;
            var seatListData = data.seatList;
            var querySalePriceData = data.querySaleclassList;
            // 存可操作性的分区
            dataBase["sectionSelectList"] = addAbleSelectSection(data.sectionSelectList);

            // 渲染票价列表
            renderData.priceList(priceListData);
            dataBase["priceList"] = priceListData;

            // 渲染套票列表
            renderData.querySalePrice(querySalePriceData)

            // 渲染座位图
            renderData.seatMap(seatListData);
            dataBase["seatMap"] = seatListData;

            // 渲染分区图
            var sectionMapData = data.showMap;
            renderData.svg(sectionMapData.mapSvg)
        })

        function addAbleSelectSection(sectionSelectList){
            // 是否能选择的分区
            var isAbleSelectSection = []
            for (var i = 0; i < sectionSelectList.length; i++) {
                isAbleSelectSection.push(sectionSelectList[i].id)
            }
            return isAbleSelectSection;
        }
    }

    GetDate ();

    loginCallBack = function(){
        interaction.createOrder();
    }


    // 设置座位容器可移动
    interaction.setSeatContainerMove();
    //  设置座位可放大缩小
    //interaction.setSeatSize();
    //  设置座位容器全屏
    //interaction.setSeatContainerFullScreen();
    //  双击svg跳转页面
    interaction.svgLink();

    interaction.commitSeat();
});

