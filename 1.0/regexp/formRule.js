/**
 * 表单验证
 * 
 * @time: 2014-4-16
 * @file: regexp
 * @author: bigwind
 */

/**
 * html attribute
 * regexp: { boolean }
 * regexp: { object }
 * function: { array }
 *
 */

/**
 * function regexp param
 * @param { agruments } agruments 
 * @param { string }    value
 * @param { object }    S.Node.all
 *
 */
KISSY.add( function( S, Node, Dom ) {
    var $ = S.Node.all,
        D = S.DOM;

    function Rule() {
        this._init.apply(this, arguments);
    }

    S.augment( Rule, {
        constructor: Rule,
        _init: function(){
            var self = this;

            
        },
        msg: function(){
            var self = this;

            
        }
    });
},{
    requires: [ 'event', 'node', 'dom' ]
});