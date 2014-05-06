/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @file: viwe
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Promise, Sizzle, XTemplate ) {
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
            self._modelObj = model;

            // 唯一的uuid
            self._guid = self._modelObj._guid;

            self.$ele = $( element );

            self._getNodeList();

            self._bindEvent();
        },
        _getNodeList: function(){
            var self = this,
                nodelist = self.$ele.all( 'input,select,textarea' ),
                list = [],
                cfg = self.cfg,
                attrData = cfg.attrData,
                attrCheck = cfg.attrCheck;

            /* 
             * 有attrData属性加入到model
             * @type { text|hidden|file|password } input
             * @type { radio|checkbox } input
             * @type { select } select
             * @type { textarea } textarea
             */
            nodelist.each(function( i ){
                var data = i.attr( attrData ),
                    attrObj;

                if( data ){
                    // radio/checkbox/data-bind
                	if( i[0].type === 'radio' || i[0].type === 'checkbox' ){
                		var name = i.attr( 'name' ),
                			nameNode;

                		nameNode = self.$ele.all( 'input[name=' + name + ']');
                        attrObj = self._getAttr( i );
                        // nodeList
                        attrObj.$el = nameNode;

                        self._modelObj.setModel( attrObj );    
                       
                	// input/textarea/select
                	}else{
                        attrObj = self._getAttr( i );

                        self._modelObj.setModel( attrObj );
                	};
                    
                };
            })

            return list;
        },
        /*
         * get attribute object
         * @param { object } nodeList
         * @return { object }
         */
        _getAttr: function( element ){
            var self = this,
                i = element,
                cfg = self.cfg,
                obj = {
                    $el: i,
                    disable: '',
                    reg: null,
                    parent: '',
                    event: '',
                    // bindEle: null,
                    bindTipParent: function( element ){
                        return element.parent();
                    },
                    bindTip: function( element ){
                        return element.parent().all( '.tip' );
                    }
                };

            if( i.attr( cfg.attrData ) ){
                obj.reg = self._json( i.attr( cfg.attrData ) );
            }

            if( i.attr( cfg.attrDisable ) ){
                obj.disable = i.attr( cfg.attrDisable );
            }

            if( i.attr( cfg.attrTipParent ) ){
                obj.parent = i.attr( cfg.attrTipParent );
            }

            obj.event = self._getEvent( i[0].type );

            return obj;
        },
        // cache model
        // _setModel: function( element, attrObj ){
        //     var self = this,
        //         i = element;

        //     self._modelObj.setModel( self._modelObj._uuid_, attrObj);
            
        //     // i.data( self._guid, self._modelObj._uuid_++ );

        // },
        //radio checkbox event
        _bindEvent: function(){
            var self = this,
                cfg = self.cfg,
                model = self._modelObj._model,
                regObj = self._reg,
                et;

            S.each( model, function( i, key ){

                i.$el.on( i.event, function( e ){
                    var attrObj = i,
                        isFocus;

                    // 启用 validate
                    if( attrObj.disable === 'false' ){
                        return;
                    }
                    // data-valid 上有数据，否则结束
                    if( attrObj.reg && typeof attrObj.reg === 'object' ){
                        isFocus = (e.type === 'focus');
// console.log(e.type);
                        if( isFocus ){
                            self._handlerWarnEvent( attrObj, regObj );
                            return;
                        }
                        
                        self._handlerEvent( attrObj, regObj );
                    }
                });
                
            });
        },
        _handlerEvent: function( attrObj, regObj ){
            var self = this,
                cfg = self.cfg,
                element = attrObj.$el,
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

                var reg = regObj[ name ], val, msg;
              
                // 正则为object
                if( typeof reg === 'object' ){
                    // match是否为object
                    msg = S.isObject( match ) ? match : reg;
                    // val exist
                    val = self._getValue( attrObj );
//console.log( val );
                    //success
                    if( val.search( reg.reg ) != -1 )
                    // if( reg.reg.test( val ) === true )
                    {
                        if( cfg.isTipSuc ){
                            msg = reg.sucmsg ? reg.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                        }else{
                            msg = '';
                        }                      
                        self._render( element, attrObj, { msg: msg }, 'success' );
                    //error
                    }else{
//console.log(12345);
                        msg = msg.errmsg ? msg.errmsg : '';

                        self._render( element, attrObj, { msg: msg }, 'error' );
 
                        self._modelObj.isSubmit = false;
                        
                        isTipError = true;
                    }
                // 正则为function
                }else if( typeof reg === 'function' ){

                    // match是否为array
                    if( S.isArray( match ) ){
                        arr = [].concat( element, match, Promise );
                    }else{
                        arr = [].concat( element, Promise );
                    }

                    // var msgObj = reg.apply( element, arr );
                    var msgObj = reg.apply( self, arr ),
                        isObj = (typeof msgObj === 'object');
//console.log( msgObj );
                    // msg object and render msg
                    if( isObj && msgObj[ 'status' ] === 'success' ){
//console.log(1111);
                        // msg
                        if( cfg.isTipSuc ){
                            msg = msgObj[ 'sucmsg' ] ? msgObj.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                        }else{
                            msg = '';
                        }

                        self._render( element, attrObj, { msg: msg }, 'success' );
                    //}else if(){

                    }else{
                        msg = isObj && msgObj[ 'errmsg' ] ? msgObj.errmsg : '';

                        self._render( element, attrObj, { msg: msg }, 'error' );
                        self._modelObj.isSubmit = false;
                        isTipError = true;
                    }

                    
                };
                
            });
            
            
        },
        _handlerWarnEvent: function( attrObj, regObj ){
            var self = this,
                regAttr = attrObj.reg,
                element = attrObj.$el,
                match, reg, val;

            
            val = self._getValue( attrObj );
            if( val !== '' ) return;

            S.each( regAttr, function( key, name ){
                match = regAttr[ name ];
                reg = regObj[ name ];

                return false;
            })

            // match是否为object
            msg = S.isObject( match ) ? match : reg;
            msg = msg.warnmsg ? msg.warnmsg : ''

            self._render( element, attrObj, { msg: msg }, 'warn' );
        },
        _getEvent: function( type ){
            var event = 'blur',
                self = this,
                isTipWarn = self.cfg.isTipWarn;

            switch( type ){                
                case 'checkbox':
                case 'radio':
                    event = 'click change';
                    break;
                case 'select-multiple':
                case 'select-one':
                case 'file':
                    event = 'change blur';
                    break;
                default:
                    event = isTipWarn ? 'keyup blur focus' : 'keyup blur';
            }

            return event;
        },
        _getValue: function( attrObj ){
            var self = this,
                trim = /(^\s*)|(\s*$)/g,
                val, ele;

            // text and checked the value
            ele = attrObj.$el.length > 1 ? $( D.filter( attrObj.$el, ':checked' ) ) : attrObj.$el;
            val = ele.val();
            val = typeof val === 'string' ? val.replace( trim, '') : typeof val === 'object' ? val : '';

            return val;
        },
        _json: function( strJSON ){
            try{
                strJSON = new Function('return' + strJSON)();
            }catch( e ){
                throw new Error( 'attrData format error' );
            }
            return strJSON;
        },
        // @return { element }
        _getTemplate: function( data, status ){
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
        _render: function( element, attrObj, msg, status ){
            var self = this,
                cfg = self.cfg,
                tip, parent, html;

            tip = attrObj.bindTip( element );

            // tip already exist
            if( tip.length != 0 ){
                html = self._getTemplate( msg, status );
                tip.replaceWith( html );

            // no tip
            }else{
                // parent
                if( attrObj.parent ){
                    parent = $( attrObj.parent );
                }else{
                    parent = attrObj.bindTipParent( element );
                }

                html = self._getTemplate( msg, status );
                parent.append( html );
            }

        }
        
    });

    return Viwe;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'promise', 'sizzle', 'xtemplate' ]
});