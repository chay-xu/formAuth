/**
 * 表单验证
 * mvvm
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
KISSY.add( function( S ) {
    return {
            date: { 
                reg: /^((?:(?:19)|(?:2\d))\d{2})[\-\.\/]?((?:10|11|12)|(?:0?[1-9]))[\-\.\/]?((?:0?[1-9])|(?:[12]\d)|(?:30|31))$/g,
                errmsg: '日期格式不正确',
                sucmsg: '日期格式正确',
            },
            number: { 
                reg: /^[0-9]{10,16}$/g, 
                errmsg: '只能为数字'
            },
            range64: { 
                reg: /^(.){0,64}$/g, 
                errmsg: '长度不超过64，不允许空格',
                sucmsg: '验证正确'
            },
            range50: {
                reg: /^(.){0,50}$/g, 
                errmsg: '长度不超过50，不允许空格'
            },
            // empty: function( val ){
            //     if( val == '' || val == null ){
            //         return '不能为空';
            //     }
            // },
            empty: { 
                reg: /(.)|(\n)+/g, 
                errmsg: '必填',
                warnmsg: '请输入'
            },
            email: { 
                reg: /^([a-zA-Z0-9\_\-\.])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/, 
                errmsg: '邮箱格式不正确'
            },
            txt: { 
                reg: /\.(txt|TXT)$/, 
                errmsg: '只能是txt文件'
            },
            bind: function( field, bindName ){
                var val = field.val(),
                    bindVal = S.Node.all('[name='+ bindName + ']').val();

                if( bindVal != val ){
                    return {
                        status: 'error',
                        errmsg: '密码长度不一致'
                    }
                }
            },
            ajax: function( field, Promise ){
                // var defer = new Promise.Defer(),
                var name = field.val(),
                    msgObj;
console.log(this);
                var cb = S.IO.get( "json.php", {
                        name: name
                    }, function( data ){
                        console.log(data);
                        if( data == 'ok'){
                            //验证成功，传送数据
                            msgObj = {
                                status: 'success',
                                sucmsg: '用户名未注册'
                            };
                        }else{
                            //验证失败，一样传送数据
                            msgObj =  {
                                status: 'error',
                                errmsg: '用户名已注册'
                            };
                        }
                    }, 'text'
                );
// console.log(cb.promise);
                return msgObj;

                // cb.then(function( data ){
                //     if(data[0] == 'ok'){
                //         //验证成功，传送数据
                //         defer.resolve('1111');
                //     }else{
                //         //验证失败，一样传送数据
                //         defer.reject('2222');
                //     }
                // });
                

            },
            maxLength: function( field, length ){
                var len = field.val();

                if( len >= length ){
                    return {
                        status: 'error',
                        errmsg: '最大长度不能超过' + length
                    }
                } 
            },
            //size unit { KB }
            fileSize: function( field, size ){
                var filesize = 0;

                if( UA.webkit || UA.gecko ){ 
                    filesize = field[0].files[0].size;  
                }else if( UA.trident ){  
                    var obj_img = document.getElementById('tempimg');  
                    obj_img.dynsrc = field[0].value;  
                    filesize = obj_img.fileSize;  
                }else{  
                    return {
                        status: 'error',
                        errmsg: "无法获取文件大小，文件小于"+ size +'K'
                    };
                }
                filesize = ( filesize / 1024 );

                if( filesize > size ){
                    return {
                        status: 'error',
                        errmsg: '上传文件不能大于'+ size +'K'
                    };
                }
            }
        }
});