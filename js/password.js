(function ($) {
    //传入两个参数，element参数为要设置的标签，options为设定的参数
    var GesturePasswd= function (element, options) {
        this.$element	= $(element);
        this.options	= options;
        var that=this;
        //被选中时大院中的小圆的半径 10
        this.pr=options.pointRadii; 
        //大圆点的半径 23
        this.rr=options.roundRadii;
        //大圆点之间的间隙 44
        this.o=options.space;
        //绘制图案的颜色
        this.color=options.color;
        //全局样式
        this.$element.css({
            "position":"relation",
            "width":this.options.width,
            "height":this.options.height,
            "background-color":options.backgroundColor,
            "overflow":"hidden",
            "cursor":"default"
        });
        //选择器规范
        if(! $(element).attr("id"))
            $(element).attr("id",(Math.random()*65535).toString());
		//给id加上#号，方便后面的当做选择器使用
        this.id="#"+$(element).attr("id");
        var Point = function (x,y){
            this.x  =x;
			this.y  =y
        };
        //设置初始化密码为空
        this.result="";
        //设定大圆圈集合空（二维数组，存放的是圆心坐标）
        this.pList=[];
        //设定被选中的圆圈集合为空（二维数组，存放的是圆心坐标）
        this.sList=[];
        this.tP=new Point(0,0);
		//插入一个canvas画布，画布宽高由传入参数来确定
        this.$element.append('<canvas class="main-c" width="'+options.width+'" height="'+options.height+'" >');
        //this.$element.append('<canvas class="main-p" width="'+options.width+'" height="'+options.height+'" >');
        this.$c= $(this.id+" .main-c")[0];
        this.$ctx=this.$c.getContext('2d');
        //定义initDraw()方法实现绘制只有九个圆圈的初始画布
        this.initDraw=function(){
		    //使用传入的参数中设置的颜色来规定笔触颜色
            this.$ctx.strokeStyle=this.color;
			//笔触的粗细
            this.$ctx.lineWidth=2;
		//3x3的循环实现画出九个圆圈
            for(var j=0; j<3;j++ ){
                for(var i =0;i<3;i++){
				    //使用moveTo规定下笔位置的（x,y）坐标，(22+20+i*（44+20）,22+10+j*（44+20）)
                    this.$ctx.moveTo(this.o/2+this.rr*2+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr));
                    //使用画弧方法,ctx.arc(100,75,50,0,2*Math.PI)
					this.$ctx.arc(this.o/2+this.rr+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr),this.rr,0,2*Math.PI);
                    var tem=new Point(this.o/2+this.rr+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr));
                    //如果长度还在9之内的话，就把每大圆的圆心点坐标放入pList数组中去，也就是说pList中有九个元素
                    if (that.pList.length < 9)
                        this.pList.push(tem);
                }
            }
            //落笔画圆
            this.$ctx.stroke();
            //获取图像信息对象，起始点为(0,0),获取范围的宽高为输入的宽高
            this.initImg=this.$ctx.getImageData(0,0,this.options.width,this.options.height);
        };
        //调用initDraw()方法实现画布初始化
        this.initDraw();
        //定义isIn方法，传入用户实时触摸点坐标值，判断用户滑动的点是否进入了九个点中的任意一个，如果进入了则返回该大圆圈的圆心坐标
        this.isIn=function(x,y){
            for (var p in that.pList){
            	//Math.pow(底数，次幂)，返回次方计算结果。这里用于判断用户实时触摸点距离某个大圆的圆心的距离是否小于大圆半径
                if(( Math.pow((x-that.pList[p]["x"]),2)+Math.pow((y-that.pList[p]["y"]),2) ) < Math.pow(this.rr,2)){
                    return that.pList[p];
                }
            }
            return 0;
        };
        //ponitDraw()方法是绘制轨迹上的实心小圆的
        this.pointDraw =function(c){
        	//arguments.length表示调用函数的时传给函数的参数个数，这里用于判断你是否传入了c
            if (arguments.length>0){
                that.$ctx.strokeStyle=c;
                that.$ctx.fillStyle=c;
            }
            for (var p in that.sList){
            	//讲画笔移动到用户触碰到的大圆圆心上，然后开始画小圆实心圆弧
                that.$ctx.moveTo(that.sList[p]["x"]+that.pr,that.sList[p]["y"]);
                that.$ctx.arc(that.sList[p]["x"],that.sList[p]["y"],that.pr,0,2*Math.PI);
                that.$ctx.fill();
            }
        };
        //lineDraw()方法用于绘制轨迹线
        this.lineDraw=function (c){
        	//arguments.length表示调用函数的时传给函数的参数个数，这里用于判断你是否传入了c
            if (arguments.length>0){
                that.$ctx.strokeStyle=c;
                that.$ctx.fillStyle=c;
            }
            if(that.sList.length > 0){
                for( var p in that.sList){
                	//如果是第一次循环，也即是用户触摸的第一个点，就要执行moveTo的方法，实现画笔初始位置设置
                    if(p == 0){
                        //console.log(that.sList[p]["x"],that.sList[p]["y"]);
                        that.$ctx.moveTo(that.sList[p]["x"],that.sList[p]["y"]);
                        continue;
                    }
                    //持续地连线
                    that.$ctx.lineTo(that.sList[p]["x"],that.sList[p]["y"]);
                    //console.log(that.sList[p]["x"],that.sList[p]["y"]);
                }
            }
        };
        //allDraw执行绘制图案的方法
        this.allDraw =function(c){
            if (arguments.length>0){
                this.pointDraw(c);
                this.lineDraw(c);
                that.$ctx.stroke();
            }
            else {
                this.pointDraw();
                this.lineDraw();
            }

        };
        this.draw=function(x,y){
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            //that.initDraw();
            //直接释放出之前保存的图像信息，也就是指的在画布上呼出的九个大圆圈
            that.$ctx.putImageData(this.initImg,0,0);
            //执行画点、画线方法
            that.$ctx.lineWidth=4;
              //调用画点画线方法时候，给方法传递颜色参数
            that.pointDraw(that.options.lineColor);
            that.lineDraw(that.options.lineColor);
            that.$ctx.lineTo(x,y);
            that.$ctx.stroke();
        };
        //pointInList()方法计算用户划过了几个点，并返被选中的点的编号,要是不符合
        this.pointInList=function(poi,list){
            for (var p in list){
                if( poi["x"] == list[p]["x"] && poi["y"] == list[p]["y"]){
                	//（因为p从0开始，为方便起见，返回时p需要自加1）
                    return ++p;
                }
            }
            return false;
        };
    //接下来开始判断各种用户操作，以触发各种行为
        this.touched=false;
        //这里的this.id在前文已经通过字符串处理，加上了“#”
        //当鼠标按下、触摸开始，设置touchued为true；
        $(this.id).on ("mousedown touchstart",{that:that},function(e){
            e.data.that.touched=true;
        });
        //当鼠标抬起、触摸结束，设置touched为false，并且依次执行：清空画布、初始化画布、绘制画布。
        //注意这里面执行的绘制路径与鼠标未松开、触摸未结束的时候位置的并不是同一个图像，只是把之前绘制的总结了一遍，并且进行了重新绘制
        $(this.id).on ("mouseup touchend",{that:that},function(e){
            e.data.that.touched=false;
            //清除绘图区内容，清空的范围大小由传入的数据而定
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(e.data.that.initImg,0,0);
            //通过设置这里的笔触颜色可以看出，最终图案和过程图案不是同一张图
            that.allDraw("green");
            that.$ctx.stroke();
            for(var p in that.sList){
                if(e.data.that.pointInList(that.sList[p], e.data.that.pList)){
                	//得到pointInList方法返回的被选中的圆圈相对应的编号，并进行result密码的字符串追加
                    e.data.that.result= e.data.that.result+(e.data.that.pointInList(that.sList[p], e.data.that.pList)).toString();
                }
            }
			//手动触发"hasPasswd"事件
            $(element).trigger("hasPasswd",that.result);
			
        });
        //处理鼠标拖动、手指移动事件
        $(this.id).on('touchmove mousemove',{that:that}, function(e) {
            if(e.data.that.touched){
            	//获取触摸结束的相对于文档的x,y值
                var x= e.pageX || e.originalEvent.targetTouches[0].pageX ;
                var y = e.pageY || e.originalEvent.targetTouches[0].pageY;
                //然后减去canvas画布在页面中的位置，即可获得在画布中的x,y位置
                x=x-that.$element.offset().left;
                y=y-that.$element.offset().top;
                //判断用户通过的点是否在九个大圆范围内，并返回通过的大圆放入数组中
                var p = e.data.that.isIn(x, y);
                //console.log(x)
                //判断如果经过圆数目不为0个，则把这个圆的圆心坐标追加入sList中
                if(p != 0 ){
                    if ( !e.data.that.pointInList(p,e.data.that.sList)){
                        e.data.that.sList.push(p);
                    }
                }
                //console.log( e.data.that.sList);
                e.data.that.draw(x, y);
            }

        });
        //设定密码错误事件，并给出处理方案
        $(this.id).on('passwdWrong',{that:that}, function(e) {
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(that.initImg,0,0);
            that.allDraw("purple");
            that.result="";
            that.pList=[];
            that.sList=[];

            setTimeout(function(){
                that.$ctx.clearRect(0,0,that.options.width,that.options.height);
                that.$ctx.beginPath();
                that.initDraw()
            },500)

        });
        $(this.id).on('passwdRight',{that:that}, function(e) {
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(that.initImg,0,0);
            that.allDraw("yellow");
            that.result="";
            that.pList=[];
            that.sList=[];
            setTimeout(function(){
                that.$ctx.clearRect(0,0,that.options.width,that.options.height);
                that.$ctx.beginPath();
                that.initDraw()
            },500)
        });


    };
    GesturePasswd.DEFAULTS = {
        zindex :100,
        roundRadii:25,
        pointRadii:6,
        space:30,
        width:240,
        height:240,
        lineColor:"#00aec7",
        backgroundColor:"#252736",
        color:"#FFFFFF"
    };
    function Plugin(option,arg) {
        return this.each(function () {
            var $this   = $(this);
            var options = $.extend({}, GesturePasswd.DEFAULTS, typeof option == 'object' && option);
            var data    = $this.data('GesturePasswd');
            var action  = typeof option == 'string' ? option : NaN;
            if (!data) $this.data('danmu', (data = new GesturePasswd(this, options)));
            if (action)	data[action](arg);
        })
    }
    //jQuery.fn.extend(object);给jQuery对象添加方法.这里把设置好的方法挂到$类下面，方便以后调用
    $.fn.GesturePasswd             = Plugin;
    $.fn.GesturePasswd.Constructor = GesturePasswd;
})(jQuery);



