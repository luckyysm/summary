/**
 * Created by Administrator on 2017/9/26.
 */
//筛选条件
//function filter(selector,event,element,types){
//    var element=element?element:"";
//
//    $(selector).on(event,element,function(){
//        var url_str = 'index.php?m=used_car&c=index&a=search_car';
//        var value;
//        if(event=="change"){
//            value=$(selector).val();
//        }else{
//            value=$(this).attr('data-id');
//        }
//        for(var i in urlArr){
//            if(types==i){
//                if(types=="money"){
//                    if(cur_location.indexOf("min_money")!=-1){
//                        var min_money=getURLParameter("min_money");
//                        var max_money=getURLParameter("max_money");
//                        url_str=url_str.replace("&min_money="+min_money+"&max_money="+max_money,'');
//                        var url_str2 = url_str + '&'+types+'=' + value;
//                    }else{
//                        url_str = url_str + '&'+types+'=' + value;
//                    }
//                }
//                else {
//                    url_str = url_str + '&'+i+'=' + value;
//                }
//            }else {
//                if(urlArr[i]){
//                    url_str = url_str + '&'+i+'=' + urlArr[i];
//                }
//            }
//        }
//        window.location.href=url_str2?url_str2:url_str;
//
//    });
//
//}
//例如：品牌筛选
//filter(".list-brand",'click','span','brand');


// 验证姓名
function isChinaName(name) {
    var pattern = /^[\u4E00-\u9FA5]{1,6}$/;
    return pattern.test(name);
}
//验证手机号
function isPhoneNo(phone){
    var pattern = /^1[345678]\d{9}$/;
    return pattern.test(phone);
}

//获取url地址栏的方法，name为url中想要获取的值的字段
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


//点击获取验证码,点击登陆
/*codeBtn：获取验证码按钮，loginBtn:登陆按钮，phoneName：手机号，tanName:弹框，codeUrl:验证码请求的接口，
 loginUrl:登陆请求的接口，phoneFiled:请求验证码接口传的手机号字段，codeFiled:请求登陆接口传的验证码字段
*
* */

//function getCode(codeBtn,loginBtn,phoneName,tanName,codeUrl,loginUrl,phoneFiled,codeFiled){
//    var time = 60,temp=1;
//    $(codeBtn).click(function (event) {
//        //console.log(111)
//        event.stopPropagation();
//        if (temp) {
//            var phone = $(phoneName).val()||$(phoneName).text();
//            var phone_result = isPhoneNo(phone);
//            if (!phone_result) {
//                $(tanName).text('电话格式不正确').css({display:'block'});
//
//                setTimeout(function(){
//                    $(tanName).text('电话格式不正确').css({display:'none'});
//                },800);
//                //return;
//            } else {
//                //请求验证码接口
//                //成功之后
//                $.post(codeUrl, {phoneFiled: phone}, function (data) {
//                    temp = 0;
//                    //console.log(data);
//                    var obj = eval("(" + data + ")");
//                    //alert(obj.info);
//                    if (obj.code == 1) {
//                        var timer = setInterval(function () {
//
//                            time = time - 1;
//                            $(codeBtn).text('已发送(' + time + 's)');
//                            if (time == -1) {
//                                clearInterval(timer);
//                                temp = 1;
//                                $(codeBtn).text('重新获取');
//                                time = 60;
//                            } else {
//
//                            }
//                        }, 1000);
//                    }
//                });
//
//            }
//        }
//    });
//    $(loginBtn).click(function () {
//        var phone = $('#phone').val(),
//            code = $('#code').val();
//        var p = isPhoneNo(parseInt(phone));
//        if (!p) {
//            $(tanName).text('电话格式不正确').css({display:'block'});
//
//            setTimeout(function(){
//                $(tanName).text('电话格式不正确').css({display:'none'});
//            },800);
//        } else if (!code) {
//            $(tanName).text('请输入验证码').css({display:'block'});
//
//            setTimeout(function(){
//                $(tanName).text('请输入验证码').css({display:'none'});
//            },800);
//        } else {
//            $.post("loginUrl", {"phone": phone, "code": code}, function (data) {
//                var obj = eval("(" + data + ")");
//                if (obj.code == 1) {
//                    window.open("billing", '_self');
//                }else{
//                    $(tanName).text(obj.info).css({display:'block'});
//
//                    setTimeout(function(){
//                        $(tanName).text(obj.info).css({display:'none'});
//                    },800);
//                }
//            })
//        }
//    });
//
//}
/*
 获取URL中指定的参数
 例如：
 URL:test.com/test.aspx?test=t
 var t=helper.request.queryString("test");
 得到t
 */

//helper.request = {
//    queryString:
//        function (item) {
//            locationSearch = "";
//            var tmpLocationArr = location.href.split("?");
//            if (tmpLocationArr.length > 1) locationSearch = "?" + tmpLocationArr[1];
//            var svalue = locationSearch.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
//            var Qvalue = svalue ? svalue[1] : svalue;
//            if (Qvalue == null) {
//                return "";
//            } else {
//                return Qvalue.trim();
//            }
//        },
//    queryurl:
//        function (url, item) {
//            locationSearch = "";
//            var tmpLocationArr = url.split("?");
//            if (tmpLocationArr.length > 1) locationSearch = "?" + tmpLocationArr[1];
//            var svalue = locationSearch.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
//            var Qvalue = svalue ? svalue[1] : svalue;
//            if (Qvalue == null) {
//                return "";
//            } else {
//                return Qvalue.trim();
//            }
//        }
//};
/*
 helper.cookies.set("id", result.data, 7);
 id为存在cookie里的key值  result.data为id 的vlue值  7为存在cookie里的时间限制为7天
 * var id = helper.cookies.get("id");
 * 从cookie里获取存的id
 *
 * */
//helper.cookies = {
//    del: function (name) {
//        var exp = new Date();
//        exp.setTime(exp.getTime() - 1);
//        var cval = helper.cookies.get(name);
//        if (cval != null)
//            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
//    },
//    set: function (name, value, remember) {
//        if (remember == true) {
//            var Days = 30;
//            var exp = new Date();
//            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
//            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
//        }
//        else {
//            document.cookie = name + "=" + escape(value) + ";path=/";
//        }
//    },
//    setday: function (name, value, remember) {
//        var Days = remember;
//        var exp = new Date();
//        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
//        document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
//
//    },
//    setdomain: function (name, value, remember) {
//        var domain = window.location.host.split(".");
//        if (remember == true) {
//            var Days = 30;
//            var exp = new Date();
//            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
//            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString() + ";domain=." + domain[domain.length - 2] + "." + domain[domain.length - 1];
//        }
//        else {
//            document.cookie = name + "=" + escape(value) + ";path=/" + ";domain=." + domain[1] + "." + domain[2];
//        }
//    },
//    get: function (name) {
//        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//
//        if (arr = document.cookie.match(reg)) {
//            return unescape(arr[2]);
//        } else {
//            return '';
//        }
//    }
//};

