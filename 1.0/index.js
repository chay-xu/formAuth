/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle, FormModel, FormViwe, Validate, Field ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA,
        isUpload = false,
        def = {
            attrValid: 'data-valid',
            attrTipParent: 'data-parent',
            attrDisable: 'data-disable',
            // attrReadonly: 'readonly',
            isReadonly: false,
            isAllTip: false,
            isTipSuc: true,
            isTipWarn: true,
            tipSuc: '验证成功',
            // regObj: null,
            tipParent: function( element ){
                $warpper = $('<div class="msg-wrapper"></div>').appendTo( element.parent() );
                return $warpper;
            },
            tpl:{
                success:'<div class="tip tip-success-ico">{{msg}}</div>',
                error:'<div class="tip tip-error-ico">{{msg}}</div>',
                warn:'<div class="tip tip-warn-ico">{{msg}}</div>'
            }
        };
        
    function FormAuth() {
        this._init.apply(this, arguments);
    }
//     var a = new Field( {$el: '999', reg: {} } );
//     var b = new Field( {$el: 'xxxx'} )
// //console.log( a.delRule('yy') );
// var c = S.merge( a );
// c.$el = 'lll';
// console.log( c );
// console.log( a );
    
    S.augment( FormAuth, {
        constructor: FormAuth,
        version: '1.0.0',
        _init: function( element, config ) {
            var self = this;

            // cache
            self.cache = {};
            // reg
            self.ruleObj = Validate;
            // config
            self.cfg = S.merge( def, config );

            // model object
            self._modelObj = new FormModel();

            // model
            self._model = self._modelObj._model;
            self._guid = self._modelObj._guid;

            // viwe object
            self._viwe = new FormViwe( element, self.cfg, self.ruleObj, self._modelObj );

            // self.$model = self._getNodeList( self.$ele );
            //self.$nodeList = self._viwe.$nodeList;
            //cache attr
            // self.cache.attr = self._getAttr();

            // self._viwe._bindEvent( self.$model, self.cache.reg );
            // self._bindEvent();

        },
        enable: function( element, status ){
            var self = this,
                ele = $( element ),
                status, index, fieldObj;

            status = status === false ? 'false' : 'true';
            
            index = ele.data( self._guid );
            fieldObj = self._model[ index ];

            // change model
            fieldObj.disable = String( status );
 
            if( status )
                self._viwe._removeTip( ele, fieldObj );

            return this;
        },
        //添加正则
        addRule: function( regObj ){

            S.mix( this.reg, regObj );
        },
        //删除正则
        delRule: function( regName ){

            delete this.reg[ regName ];
        },
        getRules: function( regName ){

            return regName ? this.reg[ regName ] : this.reg;
        },
        getField: function( className ){
            var self = this,
                index = $( className ).data( self._guid );

            return self._model[ index ];
        },
        validate: function(){
            var self = this,
                cfg = self.cfg;
            
            self._modelObj.isSubmit = true;

            if( arguments[0] ){
                $( arguments[0] ).fire('keyup');
            }else{
                S.each( self._model, function( i, key ){

                    var et = i.event.split( ' ' )[0];
                    i.$el.fire( et );
                    console.log(i.$el[0])
                    if( !self.cfg.isAllTip && self._modelObj.isSubmit === false ){
                        i.$el.fire( 'focus' );
                        return false;
                    }
                    
                })
                
            }
            
            return self._modelObj.isSubmit;
        }
    });

    return FormAuth;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle', './formModel', './formViwe', './regexp/formAuth-zh_CN', './formField' ]
});