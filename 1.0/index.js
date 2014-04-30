/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle, FormModel, FormViwe, RegValidate ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA,
        isUpload = false,
        def = {
            attrName: 'data-valid',
            attrTipParent: 'data-parent',
            attrDisable: 'data-disable',
            attrReadonly: 'readonly',
            attrEvent: 'data-event',
            isReadonly: false,
            isAllTip: false,
            isTipSuc: true,
            tipSuc: '验证成功',
            tpl:{
                success:'<div class="tip tip-success">{{msg}}</div>',
                error:'<div class="tip tip-error">{{msg}}</div>'
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

            // cache
            self.cache = {};
            // reg
            self.reg = RegValidate;
            // config
            self.cfg = S.merge( def, config );

            // model object
            self._modelObj = new FormModel();

            // model
            self._model = self._modelObj._model;
            self._guid = self._modelObj._guid;

            // viwe object
            self._viwe = new FormViwe( element, self.cfg, self.reg, self._modelObj );

            // self.$model = self._getNodeList( self.$ele );
            //self.$nodeList = self._viwe.$nodeList;
            console.log(self._model._uuid_)
            //cache attr
            // self.cache.attr = self._getAttr();

            // self._viwe._bindEvent( self.$model, self.cache.reg );
            // self._bindEvent();

        },
        disable: function( element, status ){
            var self = this,
                ele = $( element ),
                status = status ? status : true,
                index, attrObj;
            
            index = ele.data( self._guid );
            attrObj = self._model[ index ];

            // change model
            attrObj.disable = String( status );

            if( status )
                self._viwe._removeTip( ele, attrObj );
        },
        //添加正则
        addRule: function( regObj ){

            S.mix( this.reg, regObj );
        },
        //删除正则
        delRule: function( regName ){

            delete this.reg[ regName ];
        },
        // bind a new validate
        field: function( className, regexp ){
            var self = this,
                index = $( className ).data( self._guid );

            S.mix( self._model[ index ].reg, regexp );
        },
        valid: function(){
            var self = this,
                cfg = self.cfg;
            
            self._model.isSubmit = true;

            if( arguments[0] ){
                $( arguments[0] ).fire('keydown');
            }else{
                S.each( self._model, function( i, key ){

                    i.$el.fire('keyup');
                    if( !self.cfg.isAllTip && self._model.isSubmit != true ){
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
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle', './formModel', './formViwe', './regexp/formAuth-zh_CN' ]
});