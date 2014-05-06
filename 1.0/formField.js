/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @author: bigwind
 */

KISSY.add( function( S ) {
        
    function Field() {
        this._init.apply(this, arguments);
    }

    S.augment( Field, {
        constructor: Field,
        _init: function( config ) {
            var self = this;

            // self._model = {};
            // self._model =  S.mix( self._model, config );

            // model
            S.mix( self, config );
        },
        //添加正则
        addRule: function( regObj ){

            S.mix( this._model.reg, regObj );
        },
        //删除正则
        delRule: function( regName ){
            var reg = this._model.reg;

            if( reg.hasOwnProperty( regName ) ){
                delete reg[ regName ];

                return true;
            }else{
                return false;
            }
        },
        set: function( name, value ){
            var self = this;

            self._model[ name ] = value;
        },
        get: function( name ){
            var self = this;

            return self._model[ name ];
        },
        valid: function( event ){
            var self = this,
                event = event ? event : 'keyup';
            
            self._model.$el.fire( event );
        }
    });

    return Field;
});