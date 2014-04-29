/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle, RegValidate, FormModle, FormViwe ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA,
        isUpload = false,
        isTrue = true,
        reg = RegValidate,
        def = {
            attrName: 'data-valid',
            attrTipParent: 'data-parent',
            attrDisable: 'data-disable',
            attrReadonly: 'readonly',
            attrEvent: 'data-event',
            isReadonly: false,
            isAllTip: false,
            isTipSuc: true,
            msg:{
                tpl:'<div class="tip tip-error">{{msg}}</div>'
            }
        };
        
    function FormAuth() {
        this._init.apply(this, arguments);
    }

    
    S.augment( FormAuth, {
        constructor: FormAuth,
        version: '1.0.0',
        _init: function( element, config ) {
            var self = this;

            //cache
            self.cache = {};
            //config
            self.cfg = S.merge( def, config );

            //cache reg
            self.cache.reg = self.getRegexp();

            self._viwe = new FormModle( element, self.cfg, self.cache.reg );

            // self.$modle = self._getNodeList( self.$ele );
            //self.$nodeList = self._viwe.$nodeList;
            console.log(self.$nodeList)
            //cache attr
            // self.cache.attr = self._getAttr();

            // self._viwe._bindEvent( self.$modle, self.cache.reg );
            // self._bindEvent();

        },
        _getNodeList: function( parent ){
            var self = this,
                nodelist = parent.all( 'input,select,textarea' ),
                list = [],
                cfg = self.cfg,
                name = cfg.attrName;

            /* 
             * 有attrName属性加入到model
             * @val { text|hidden|file|password } input
             * @val { radio|checkbox } input
             * @val { select } select
             * @val { textarea } textarea
             */
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

            S.each( self.$modle, function( i, key ){
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
                isTipError = false, //禁止多次显示错误
                arr;

            // data-valid 上有数据，否则结束
            if( typeof attrObj === "object" ){
                // 验证input上多个正则
                S.each( attrObj, function( key, name ){
                    // 禁止多次显示错误
                    if( isTipError ) return false;
                    
                    var attr = attrObj[ name ];
                    // 不启用正则
                    if( attr === 'false') return;

                    var val = element.val().replace( /(^\s*)|(\s*$)/g, ''),
                        reg = regObj[ name ],
                        msg;

                    // 正则为array
                    // 改 isArray
                    if( typeof reg === 'object' ){
                        msg = S.isObject( attr ) ? attr : reg;

                        //success
                        if( val.search( reg.reg ) != -1 )
                        {
                            msg = reg.sucmsg ? reg.sucmsg : '';
                            self._setTpl( element, { msg: msg } );
                        //error
                        }else{
                            msg = msg.errmsg ? msg.errmsg : '';
                            self._setTpl( element, { msg: msg } );
                            isTrue = false;
                            isTipError = true;
                        }
                    // 正则为function
                    }else if( typeof reg === 'function' ){

                        // data-valid 正则值是否为array
                        if( S.isArray( attr ) ){
                            arr = attr.concat( val );
                        }else{
                            arr = [].concat( val );
                        }

                        msg = reg.apply( element, arr );
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
        // bind a new validate
        field: function( className, regexp ){
            $( className )
        },
        //添加正则
        addRule: function( regObj ){

            S.mix( reg, regObj );
        },
        //删除正则
        delRule: function( regName ){

            delete reg[ regName ];
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

                    i.fire('keyup');
                    if( !self.cfg.isAllTip && isTrue != true ){
                        i.fire( 'focus' );
                        return false;
                    }
                    
                }) 
            }
            
            return isTrue;
        }
    });

    return FormAuth;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle', './regexp/formAuth-zh_CN', './formModle', './formViwe' ]
});