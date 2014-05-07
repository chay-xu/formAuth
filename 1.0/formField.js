/**
 * 表单验证
 * 
 * @time: 2014-4-16
 * @file: field
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

            self._currentRuleName = '';

            // model
            S.mix( self, config );
        },
        //添加正则
        addRule: function( ruleObj ){

            S.mix( this.rules, ruleObj );
        },
        //删除正则
        delRule: function( ruleName ){
            var rules = this.rules;

            if( rules.hasOwnProperty( ruleName ) ){
                delete rules[ ruleName ];

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
        setMsg: function( status, string ){
            var self = this,
                name = self._currentRuleName;

            if( self.rules[ name ] === true ){
                self.rules[ name ] = {};
            }

            self.rules[ name ][ status ] = string;
        },
        getMsg: function( name ){
            var self = this;

            return name ? self.rules[ name ] : self.rules;
        },
        valid: function( event ){
            var self = this,
                event = event ? event : 'blur';
            
            self._model.$el.fire( event );
        }
    });

    return Field;
});