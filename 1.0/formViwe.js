/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @file: viwe
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle, XTemplate ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM;
        
    function Viwe() {
        this._init.apply(this, arguments);
    }

    
    S.augment( Viwe, {
        constructor: Viwe,
        _init: function( element, config, regexp, model ) {
            var self = this;

            //config
            self.cfg = config;

            self._reg = regexp;

            // model
            self._model = model;

            // 唯一的uuid
            self._guid = self._model._guid;

            self.$ele = $( element );

            self._getNodeList();

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
                        
                		// for ( n = nameNode.length - 1 ; n >= 0; n-- ) {
                		// 	//list.push( $( nameNode[ n ] ) );
                  //           console.log( $( nameNode[ n ] ) );
                  //           //(function( n ){
                  //               self._setModel( $( nameNode[ n ] ), attrObj, n );
                  //           //})( n );
                		// };
                        S.each( nameNode, function( i, key ){
                            self._setModel( $( nameNode[ n ] ), attrObj );
                        })
                		
                	}else{
                        //attrObj = self._getAttr( i );
                		//list.push( i );
                        //self._setModel( i, attrObj );
                        // console.log( i )
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
                    $el: i,
                    disable: '',
                    reg: [],
                    parent: '',
                    bindEle: null,
                    bindTipParent: function( element ){
                        return element.parent();
                    },
                    bindTip: function( element ){
                        return element.parent().all( '.tip' );
                    }
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
        // cache model
        _setModel: function( element, attrObj ){
            var self = this,
                i = element;
console.log(arguments[2]);
            self._model.setModel( self._model._uuid_, attrObj);
            
            i.data( self._guid, self._model._uuid_++ );

        },
        //radio checkbox event
        _bindEvent: function(){
            var self = this,
                model = self._model._model,
                regObj = self._reg;

            S.each( model, function( i, key ){
                i.$el.on('keydown blur', function( e ){
                    var ele = e.target,
                        $ele = $( ele ),
                        index = $ele.data( self._guid ),
                        attrObj = i;

                    // 启用 validate
                    if( attrObj.disable === 'false' ){
                        return;
                    }
                    // data-valid 上有数据，否则结束
                    if( attrObj.reg && typeof attrObj.reg === "object" ){
                        var isTrue = self._regEvent( $ele, attrObj, regObj );
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
                
                // 正则为object
                if( typeof reg === 'object' ){
                    // match是否为object
                    msg = S.isObject( match ) ? match : reg;

                    //success
                    if( val.search( reg.reg ) != -1 )
                    {
                        msg = reg.sucmsg ? reg.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                        self._setTpl( element, attrObj, { msg: msg }, 'success' );
                    //error
                    }else{
                        msg = msg.errmsg ? msg.errmsg : '';

                        self._setTpl( element, attrObj, { msg: msg }, 'error' );
                        self._model.isSubmit = false;
                        isTipError = true;
                    }
                // 正则为function
                }else if( typeof reg === 'function' ){

                    // match是否为array
                    if( S.isArray( match ) ){
                        arr = match.concat( val );
                    }else{
                        arr = [].concat( val );
                    }

                    var msgObj = reg.apply( element, arr );

                    if( typeof msg === 'object' ) return;
                    msg = msgObj.msg ? msgObj.msg : cfg.tipSuc ? cfg.tipSuc : '';

                    if( msg.status ){
                        self._setTpl( element, attrObj, { msg: msg }, 'success' );
                        self._model.isSubmit = false;
                        isTipError = true;
                    }else{
                        self._setTpl( element, attrObj, { msg: msg }, 'error' );
                    }

                    
                };
                
            });
            
            
        },
        _json: function( strJSON ){
            return new Function("return" + strJSON)();
        },
        // @return { element }
        _getTpl: function( data, status ){
            var self = this,
                tpl = self.cfg.tpl[ status ];

            return new XTemplate( tpl ).render( data );
        },
        _removeTip: function( element, attrObj ){
            var self = this,
                tip = attrObj.bindTip( element );;

            if( tip.length != 0 ){
                tip.remove();
            }

        },
        _setTpl: function( element, attrObj, msg, status ){
            var self = this,
                cfg = self.cfg,
                tip, parent, html;

            tip = attrObj.bindTip( element );

            // tip already exist
            if( tip.length != 0 ){
                html = self._getTpl( msg, status );
                tip.replaceWith( html );

            // no tip
            }else{
                // parent
                if( attrObj.parent ){
                    parent = $( attrObj.parent );
                }else{
                    parent = attrObj.bindTipParent( element );
                }

                html = self._getTpl( msg, status );
                parent.append( html );
            }

        }
        
    });

    return Viwe;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle', 'xtemplate' ]
});