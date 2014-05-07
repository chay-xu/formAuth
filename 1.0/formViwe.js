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
        _init: function( element, config, rules, model ) {
            var self = this;

            //config
            self.cfg = config;

            self._ruleObj = rules;

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
                attrValid = cfg.attrValid,
                attrCheck = cfg.attrCheck;

            /* 
             * 有attrValid属性加入到model
             * @type { text|hidden|file|password } input
             * @type { radio|checkbox } input
             * @type { select } select
             * @type { textarea } textarea
             */
            nodelist.each(function( i ){
                var data = i.attr( attrValid ),
                    attrObj;

                if( data ){
                    attrObj = self._getAttr( i );

                    self._modelObj.setModel( attrObj );   
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
                type = i[0].type,
                cfg = self.cfg,
                obj = {
                    $el: i,
                    disable: 'true',
                    rules: null,
                    // tipParent: '',
                    // tip: null,
                    event: '',
                    tpl: null,
                    filter: '',
                    // tipWarpper: cfg.tipWarpper,
                    $parent: null
                    
                },
                nameNode, name;

            // radio/checkbox/data-bind
            if( type === 'radio' || type === 'checkbox' ){
                name = i.attr( 'name' );

                nameNode = self.$ele.all( 'input[name=' + name + ']');
                // nodeList
                obj.$el = nameNode;
            }

            if( i.attr( cfg.attrValid ) ){
                obj.rules = self._json( i.attr( cfg.attrValid ) );
            }

            if( i.attr( cfg.attrDisable ) ){                
                obj.disable = i.attr( cfg.attrDisable );
            }

            if( i.attr( cfg.attrTipParent ) ){
                obj.$parent = $( i.attr( cfg.attrTipParent ) );
            }else{
                obj.$parent = cfg.tipParent( i );
            }

            // bind event
            obj.event = self._getEvent( i[0].type );

            return obj;
        },
        //radio checkbox event
        _bindEvent: function(){
            var self = this,
                cfg = self.cfg,
                model = self._modelObj._model,
                ruleObj = self._ruleObj,
                et;

            S.each( model, function( i, key ){

                i.$el.on( i.event, function( e ){
                    var fieldObj = i,
                        isFocus;

                    // 启用 validate
                    if( fieldObj.disable === 'false' ){
                        
                        return;
                    }
                    
                    // console.log(fieldObj.disable);
                    // data-valid 上有数据，否则结束
                    if( fieldObj.rules && typeof fieldObj.rules === 'object' ){
                        isFocus = (e.type === 'focus');
// console.log(e.type);
                        if( isFocus ){
                            self._handlerWarnEvent( fieldObj, ruleObj );
                            return;
                        }
                        
                        self._handlerEvent( fieldObj, ruleObj );
                    }
                });
                
            });
        },
        _handlerEvent: function( fieldObj, ruleObj ){
            var self = this,
                cfg = self.cfg,
                element = fieldObj.$el,
                ruleAttr = fieldObj.rules,
                isTipError = false, //禁止多次显示错误
                arr, status;
            
            // 验证input上多个正则
            S.each( ruleAttr, function( key, name ){
                // 禁止多次显示错误
                if( isTipError ) return false;
               
                // attr rule
                var match = ruleAttr[ name ];

                fieldObj._currentRuleName = name;
                // 不启用正则
                if( match === 'false') return;

                var rule = ruleObj[ name ],
                    val, msg;
              
                // 正则为object
                if( typeof rule === 'object' ){
                    // match是否为object
                    match = S.isObject( match ) ? S.mix( rule, match ) : rule;
                    // value is exist
                    val = self._getValue( element );

                    //success
                    if( val.search( match.reg ) != -1 )
                    {
                        if( cfg.isTipSuc ){
                            msg = match.sucmsg ? match.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                        }else{
                            msg = '';
                        }

                        // self._render( element, fieldObj, { msg: msg }, 'success' );
                        status = 'success';
                    //error
                    }else{
//console.log(12345);
                        msg = match.errmsg ? match.errmsg : '';

                        // self._render( element, fieldObj, { msg: msg }, 'status' );
                        status = 'error';
                        self._modelObj.isSubmit = false;
                        isTipError = true;
                    }
                // 正则为function
                }else if( typeof rule === 'function' ){

                    // if( !S.isObject( match ) ) return;
                    match = S.isObject( match ) ? match : rule;

                    // match.args是否为array
                    if(  S.isArray( match.args ) ){
                        arr = [].concat( element, match.args, Promise );
                    }else{
                        arr = [].concat( element, Promise );
                    }

                    // var msgObj = reg.apply( element, arr );
                    var msgObj = rule.apply( fieldObj, arr );

                    if( msgObj || msgObj === undefined ){
// console.log(msgObj);
                        // msg
                        if( cfg.isTipSuc ){
                            msg = match.sucmsg ? match.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                        }else{
                            msg = '';
                        }

                        // self._render( element, fieldObj, { msg: msg }, 'success' );
                        status = 'success';
                    }else{
                        msg = match.errmsg ? match.errmsg : '';

                        status = 'error';
                        self._modelObj.isSubmit = false;
                        isTipError = true;
                    }

                    // // msg object and render msg
                    // if( isObj && msgObj[ 'status' ] === 'success' ){

                    //     // msg
                    //     if( cfg.isTipSuc ){
                    //         msg = msgObj[ 'sucmsg' ] ? msgObj.sucmsg : cfg.tipSuc ? cfg.tipSuc : '';
                    //     }else{
                    //         msg = '';
                    //     }

                    //     self._render( element, fieldObj, { msg: msg }, 'success' );
                    // //}else if(){

                    // }else{
                    //     msg = isObj && msgObj[ 'errmsg' ] ? msgObj.errmsg : '';

                    //     self._render( element, fieldObj, { msg: msg }, 'error' );
                    //     self._modelObj.isSubmit = false;
                    //     isTipError = true;
                    // }

                    
                };

                self._render( element, fieldObj, { msg: msg }, status );
                
            });
            
            
        },
        _handlerWarnEvent: function( fieldObj, ruleObj ){
            var self = this,
                rulesAttr = fieldObj.rules,
                element = fieldObj.$el,
                match, rule, val;

            
            val = self._getValue( element );
            if( val !== '' ) return;

            S.each( rulesAttr, function( key, name ){
                match = rulesAttr[ name ];
                rule = ruleObj[ name ];

                return false;
            })

            // match是否为object
            msg = S.isObject( match ) ? S.mix( rule, match ) : rule;
            msg = msg.warnmsg ? msg.warnmsg : '';

            self._render( element, fieldObj, { msg: msg }, 'warn' );
        },
        _getEvent: function( type ){
            var event = 'blur',
                self = this,
                isTipWarn = self.cfg.isTipWarn;

            switch( type ){                
                case 'checkbox':
                case 'radio':
                    event = 'change click';
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
        _getValue: function( element ){
            var self = this,
                trim = /(^\s*)|(\s*$)/g,
                val, ele;

            // text and checked the value
            ele = element.length > 1 ? $( D.filter( element, ':checked' ) ) : element;
            val = ele.val();
            val = typeof val === 'string' ? val.replace( trim, '') : typeof val === 'object' ? val : '';

            return val;
        },
        _json: function( strJSON ){
            try{
                strJSON = new Function('return' + strJSON)();
            }catch( e ){
                throw new Error( 'attrValid format error' );
            }
            return strJSON;
        },
        // @return { element }
        _getTemplate: function( data, template, status ){
            var self = this,
                tpl = template ? template[ status ] : self.cfg.tpl[ status ];
// console.log( tpl );
            return new XTemplate( tpl ).render( data );
        },
        _removeTip: function( element, fieldObj ){
            var self = this;

            if( fieldObj.$warpper ){
                fieldObj.$warpper.html( '' );
            }

        },
        _render: function( element, fieldObj, msg, status ){
            var self = this,
                cfg = self.cfg,
                warpper, html;

            // tip already exist
            if( fieldObj.$parent ){
                html = self._getTemplate( msg, fieldObj.tpl, status );

                fieldObj.$parent.html( html );
            // no tip
            }else{
                // default parent
                warpper = cfg.tipWarpper( element );

                html = self._getTemplate( msg, fieldObj.tpl, status );

                warpper.append( html );
                fieldObj.$parent = warpper;
            }

        }
        
    });

    return Viwe;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'promise', 'sizzle', 'xtemplate' ]
});