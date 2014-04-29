/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle, XTemplate ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA,
        isUpload = false,
        isTrue = true;
        
    function Viwe() {
        this._init.apply(this, arguments);
    }

    
    S.augment( Viwe, {
        constructor: Viwe,
        _init: function( element, config, regexp ) {
            var self = this;

            //config
            self.cfg = config;

            self._reg = regexp;

            // 创建一个唯一的uuid
            self._guid = (function(){
                return '$_' + 
                    ( +new Date() ) + 
                    ( Math.random() + '' ).slice( -8 );
            })();

            self._uuid_ = 1;

            // model
            self._model = [];

            self.$ele = $( element );

            self.$nodeList = self._getNodeList( self.$ele );            
console.log(self._model);

            self._bindEvent();
        },
        _getNodeList: function(){
            var self = this,
                nodelist = self.$ele.all( 'input,select,textarea' ),
                list = [],
                cfg = self.cfg,
                attrName = cfg.attrName;

            /* 
             * 有attrName属性加入到model
             * @val { text|hidden|file|password } input
             * @val { radio|checkbox } input
             * @val { select } select
             * @val { textarea } textarea
             */
            nodelist.each(function( i ){
                var data = i.attr( attrName ),
                    attrObj;

                if( data ){
                	if( i[0].type === 'radio' || i[0].type === 'checkbox' ){
                		var name = i.attr( 'name' ),
                			nameNode, n;

                		nameNode = self.$ele.all( 'input[name=' + name + ']');
                        attrObj = self._getAttr( i );
                        attrObj.bindEle = nameNode;
                        
                		for ( n = nameNode.length - 1 ; n >= 0; n-- ) {
                			list.push( $( nameNode[ n ] ) );
                            self._setModle( $( nameNode[ n ] ), attrObj )
                		};
                		
                	}else{
                        attrObj = self._getAttr( i );
                		list.push( i );
                        self._setModle( i, attrObj );
                	};
                    
                };
            })

            return list;
        },
        // get attr
        _getAttr: function( element ){
            var self = this,
                i = element,
                cfg = self.cfg,
                obj = {
                    disable: '',
                    reg: [],
                    parent: '',
                    bindEle: null
                };

            if( i.attr( cfg.attrName ) ){
                obj.reg = self._json( i.attr( cfg.attrName ) );
            }

            if( i.attr( cfg.attrDisable ) ){
                obj.disable = i.attr( cfg.attrDisable );
            }

            if( i.attr( cfg.attrTipParent ) ){
                obj.parent = i.attr( cfg.attrTipParent );
            }

            return obj;

        },
        // cache modle
        _setModle: function( element, attrObj ){
            var self = this,
                i = element;


            self._model[ self._uuid_ ] = attrObj;
            
            i.data( self._guid, self._uuid_++ );

        },
        //radio checkbox event
        _bindEvent: function(){
            var self = this,
                model = self._model,
                regObj = self._reg;

            S.each( self.$nodeList, function( i, key ){
                i.on('click', function( e ){
                    var ele = e.target,
                        $ele = $( ele ),
                        index = $ele.data( self._guid ),
                        attrObj = model[ index ];

                    // 启用 validate
                    if( attrObj.disable === 'false' ){
                        return;
                    }
                    // console.log(attrObj.reg && typeof attrObj.reg === "object");
                    // data-valid 上有数据，否则结束
                    if( attrObj.reg && typeof attrObj.reg === "object" ){
                        self._regEvent( $ele, attrObj, regObj );
                    }
                });
            });
        },
        _regEvent: function( element, attrObj, regObj ){
            var self = this,
                cfg = self.cfg,
                regAttr = attrObj.reg,
                isTipError = false, //禁止多次显示错误
                arr;

            
            // 验证input上多个正则
            S.each( regAttr, function( key, name ){
                // 禁止多次显示错误
                if( isTipError ) return false;
                
                var match = regAttr[ name ];
                // 不启用正则
                if( match === 'false') return;

                var reg = regObj[ name ],
                    trim = /(^\s*)|(\s*$)/g,
                    val, msg;

                val = attrObj.bindEle ? attrObj.bindEle.filter(':checked').val().replace( trim, '') : element.val().replace( trim, '');
                // 正则为array

                if( typeof reg === 'object' ){
                    msg = S.isObject( match ) ? match : reg;

                    //success
                    if( val.search( reg.reg ) != -1 )
                    {
                        msg = reg.sucmsg ? reg.sucmsg : '';
                        console.log( msg )
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
                
            });
            
            
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
        // _getAttr: function(){
        //     var self = this,
        //         cfg = self.cfg,
        //         list = [];

        //     S.each( self.$list, function( i ){
        //         var attr =  (new Function("return " + i.attr( cfg[ 'attrName' ] )))();
        //         list.push( attr );
        //     })

        //     return list;
        // },
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
        }
    });

    return Viwe;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle', 'xtemplate' ]
});