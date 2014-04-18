/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, Sizzle, XTemplate ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA,
        isUpload = false,
        isTrue = true,
        reg = {
            date: [ /^((?:(?:19)|(?:2\d))\d{2})[\-\.\/]?((?:10|11|12)|(?:0?[1-9]))[\-\.\/]?((?:0?[1-9])|(?:[12]\d)|(?:30|31))$/g, ['日期格式不正确']],
            number: [ /^[0-9]{10,16}$/g, ['只能为数字']],
            range64: [ /^(.){0,64}$/g, ['长度不超过64，不允许空格']],
            range50: [ /^(.){0,50}$/g, ['长度不超过50，不允许空格']],
            // empty: function( val ){
            //     if( val == '' || val == null ){
            //         return '不能为空';
            //     }
            // },
            empty: [ /(.)|(\n)+/g, ['必填']],
            email: [ /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/, ['邮箱格式不正确']],
            // txt: [ /^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w ]*))+\.(txt|TXT)$/, ['只能是txt文件']],
            txt: [ /\.(txt|TXT)$/, ['只能是txt文件']],
            maxLength: function( length, val ){
                if( val.length > length ){
                    return '最大长度不能超过' + length;
                } 
            },
            //size unit { M }
            fileSize: function( size, userFile ){
                var filesize = 0;

                if( UA.webkit || UA.gecko ){ 
                    filesize = this[0].files[0].size;  
                }else if( UA.trident ){  
                    var obj_img = document.getElementById('tempimg');  
                    obj_img.dynsrc = this[0].value;  
                    filesize = obj_img.fileSize;  
                }else{  
                    return "无法获取文件大小，文件小于"+ size +'M';
                }
                filesize = ( filesize / 1024 ) / 1024;

                if( filesize > size ){
                    return '上传文件不能大于'+ size +'M';
                }
            }
        },
        def = {
            attrName: "data-valid",
            attrTipParent: "data-parent",
            attrDisable: "data-disable",
            attrReadonly: "readonly",
            isReadonly: false,
            isAllTip: true,
            tipClass: '.tip',
            msg:{
                tpl:'<div class="tip tip-error">{{msg}}</div>'
            }
        };
        
    function Validate() {
        this._init.apply(this, arguments);
    }

    S.augment( Validate, {
        _init: function( element, config ) {
            var self = this;

            //cache
            self.cache = {};
            //config
            self.cfg = S.merge( def, config );

            self.$ele = $( element );

            self.$list = self._getNodeList( self.$ele );
            //cache attr
            // self.cache.attr = self._getAttr();
            //cache reg
            self.cache.reg = self.getRegexp();

            self._bindEvent();

        },
        _getNodeList: function( parent ){
            var self = this,
                nodelist = parent.all( 'input,select,textarea' ),
                list = [],
                cfg = self.cfg,
                name = cfg.attrName;

            nodelist.each(function( i ){
                var data = i.attr( name );

                if( data ){
                    list.push( i );
                };
            })

            return list;
        },
        _bindEvent: function(){
            var self = this;

            S.each( self.$list, function( i, key ){
                i.on('blur', function(){
                    if( i.attr('readonly') === 'readonly' ){
                        
                    }else{
                        i.fire('keyup');
                    }
                });
            })

            self.$ele.on('keyup', function( e ){
                var ele = e.target,
                    cfg = self.cfg,
                    $ele = $( ele ),
                    attrDis = $ele.attr( cfg.attrDisable ),
                    attrData = $ele.attr( cfg.attrName ),
                    attrRead = $ele.attr( cfg.attrReadonly );

                if( attrData ){
                    if( attrDis == 'true' ){
                        return;
                    }
                    if( cfg.isReadonly && attrRead ){
                        return;
                    }
                    if( attrData ){
                        self._regEvent( $ele, attrData );
                    }
                };
            })
        },
        _readonlyEvent: function(){

        },
        _regEvent: function( element, attrData ){
            var self = this,
                cfg = self.cfg,
                attrObj = self._json( attrData ),
                regObj = self.cache.reg,
                isTipError = false,
                arr;

            if( typeof attrObj === "object" ){
                S.each( attrObj, function( val, name ){
                    var attr = attrObj[ name ];
                    if( attr === 'false') return;

                    if( isTipError ) return;

                    var val = element.val().replace( /(^\s*)|(\s*$)/g, ''),
                        reg = regObj[ name ],
                        msg;

                    if( typeof reg === 'object' ){
                        msg = S.isArray( attr ) ? attr : reg[1];

                        if( val.search( reg[ 0 ] ) != -1 )
                        {
                            msg = msg[1] ? msg[1] : '';
                            self._setTpl( element, { msg: msg } );
                        }else{
                            msg = msg[0] ? msg[0] : '';
                            self._setTpl( element, { msg: msg } );
                            isTrue = false;
                            isTipError = true;
                        }
                    }else if( typeof reg === 'function' ){

                        arr = attr.concat( val );

                        msg = reg.apply( element, arr );
                        console.log(msg);
                        if( msg ){
                            isTrue = false;
                            isTipError = true;
                        }else{
                            msg = '';
                        }

                        self._setTpl( element, { msg: msg } );
                    };
                    
                })
            }else{
                return;
            }
            
            
        },
        _json: function( strJSON ){
            return new Function("return" + strJSON)();
        },
        // @return { element }
        _getTpl: function( data ){
            var self = this,
                tpl = self.cfg.msg.tpl;

            return new XTemplate( tpl ).render( data );
        },
        _removeTpl: function( element ){
            var self = this,
                tip = self.getTip( element.parent() );

            if( tip.length != 0 ){
                self._renderHTML( tip, '' );
            }

        },
        //append html node
        _appendTpl: function( element, node ){
            element.append( node );
        },
        //append html text
        _renderHTML: function( element, html ){
            element.html( html );
        },
        _setTpl: function( element, msg ){
            var self = this,
                cfg = self.cfg,
                isClass = true,
                tip, html;

            if( element.attr( cfg.attrTipParent ) ){
                var ele = element.attr( cfg.attrTipParent );
                
                tip = self.getTip( $( ele ) );
                isClass = false;
            }else{
                tip = self.getTip( element.parent() );
            }
            // tip = self.getTip( element );

            if( tip.length != 0 ){
                html = msg.msg;
                self._renderHTML( tip, html );
            }else{
                if( isClass ){
                    tip = self.getTipParent( element );
                }else{
                    tip = $( ele );
                }

                html = self._getTpl( msg );
                self._appendTpl( tip, html );
            }

        },
        //parent node
        getTipParent: function( element ){
            return element.parent();
        },
        //tip node
        getTip: function( element ){
            return element.all( this.cfg.tipClass );
        },
        _getAttr: function(){
            var self = this,
                cfg = self.cfg,
                list = [];

            S.each( self.$list, function( i ){
                var attr =  (new Function("return " + i.attr( cfg[ 'attrName' ] )))();
                list.push( attr );
            })

            return list;
        },
        getRegexp: function(){
            return reg;
        },
        add: function(){

        },
        addRule: function(){

        },
        disable: function( element ){
            var self = this,
                cfg = self.cfg,
                ele = $( element );
            
            ele.val('');
            ele.attr( cfg.attrDisable, 'true' );
            self._removeTpl( ele );
        },
        enable: function( element ){
            var self = this,
                cfg = self.cfg,
                ele = $( element );
            
            ele.attr( cfg.attrDisable, 'false' );
        },
        valid: function(){
            var self = this,
                cfg = self.cfg;
            
            isTrue = true;

            if( arguments[0] ){
                $( arguments[0] ).fire('keyup');
            }else{
                S.each( self.$list, function( i, key ){
                    if( !self.cfg.isAllTip && isTrue != true ) return;
                    i.fire('keyup');
                }) 
            }
            
            return isTrue;
        }
    });

    return Validate;
}, {
    requires: [ 'event', 'node', 'dom', 'sizzle', 'xtemplate' ]
});