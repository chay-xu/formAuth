//select 级联选择
KISSY.add('CascadeSelect', function(S){
    var addEventHandler = function(oTarget, sEventType, fnHandler) {
        if (oTarget.addEventListener) {
            oTarget.addEventListener(sEventType, fnHandler, false);
        } else if (oTarget.attachEvent) {
            oTarget.attachEvent("on" + sEventType, fnHandler);
        } else {
            oTarget["on" + sEventType] = fnHandler;
        }
    };

    var Class = {
     create:function(){
          return function(){
                this.initialize.apply(this,arguments);    
          }      
     }    
    }
    var each = function(arrList, fun){
        for (var i = 0, len = arrList.length; i < len; i++) { fun(arrList[i], i); }
    };
    var CascadeSelect = Class.create();
    CascadeSelect.prototype = {
          initialize:function(arrSelect,arrJson,options){
                if(arrSelect.length <= 0 || arrJson.length <= 0) return;
                var that = this;
                this.selects = [];
                this.menu = arrJson;
                this.options = {
                      ShowEmpty:false, //是否为空
                      EmptyText:"\u8BF7\u9009\u62E9", //没有默认值的文本
                      EmptyValue:"", //默认值
                      Txt: "txt",  //文本值
                      Val: "val",  //value值
                      Sub: "sub"   //子类
                }
                for (i in options) that.options[i] = options[i];
                this.defaults = this.options.Default || [];
                this.showEmpty = this.options.ShowEmpty;
                this.emptyText = this.options.EmptyText;
                each(arrSelect, function(o, i){
                	addEventHandler((that.selects[i] = document.getElementById(o)), "change", function(){ 
                		that.setSelect(i); 
                	});
          		});
                this.reStart();
          },
          reStart:function(){
                var sel = this.selects,
                menu = this.menu;
                this._setAllSelect(sel[0],menu,this.defaults.shift());
                this.setSelect(0);
          },
          setSelect:function(index){
                var value = "",sel = this.selects,
                that = this,
                menu = this.menu;
                for(var i=1, len = sel.length; i < len; i++){
                      
                    if(sel[i-1].selectedIndex > -1)
                          value = sel[i-1].options[sel[i-1].selectedIndex].value;
                    if(value != ""){
                          each(menu,function(o){
                                if(value == o[that.options.Val]){menu = o[that.options.Sub] || [];}
                          });
                    }else{
                    	menu = [];
                    }
                    if(i > index){
                          if(menu.length > 0){
                          		var val = "";
                          		that.defaults.length != 0 ? val = that.defaults : val;
                                this._setAllSelect(sel[i],menu, val);
                          }else{
                                this._setAllSelect(sel[i],[],"");
                          }
                    }
                }
          },
          _setAllSelect:function(sel,menu,value){
                var that = this;
                sel.options.length = 0;
                sel.disabled = false;
                if(that.showEmpty){
                      var ops = that._createOption("",that.emptyText);
                      that._setOption(sel,ops);
                      ops.selected = (false);
                }
                if(menu.length <= 0){ sel.disabled = true; return; }
                each(menu,function(menu){
                      var op = that._createOption(menu[that.options.Val],menu[that.options.Txt] ? menu[that.options.Txt] : menu[that.options.Val]);
                      that._setOption(sel,op);
                      op.selected = (value == op.value);
                });
          },
          _setOption:function(sel,op){
                sel.appendChild(op);
          },
          _createOption:function(val,txt){
                var op = document.createElement("option");
                op.value = val;
                op.innerHTML = txt;
                return op;  
          }
    }
    
    return CascadeSelect;
});