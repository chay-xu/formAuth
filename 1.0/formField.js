/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S, Event, Node, Dom, IO, Sizzle ) {
    var $ = S.Node.all,
        E = S.Event,
        D = S.DOM,
        UA = S.UA;
        
    function Field() {
        this._init.apply(this, arguments);
    }

    S.augment( Field, {
        constructor: Field,
        _init: function( element, config ) {
            var self = this;   

            self.$ele = $( element );

            self.model = {
                $el: null,
                disable: '',
                reg: [],
                parent: '',
                event: 'focus keyup blur',
                bindEle: null,
                bindTipParent: function( element ){
                    return element.parent();
                },
                bindTip: function( element ){
                    return element.parent().all( '.tip' );
                }
            };

            //config
            self.model =  S.mix( self.model, config );
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

    return Field;
}, {
    requires: [ 'event', 'node', 'dom', 'ajax', 'sizzle' ]
});