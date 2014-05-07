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
            required: function( field ){
                var val = field.val();

                if( val == 0 || val == '' ){
                    return {
                        status: 'error',
                        errmsg: '必填'
                    };
                }else{
                    return {
                        status: 'success',
                        sucmsg: 'ok'
                    };
                }
            },
            select: function( field, minlen, maxlen ){
                var val;
                if( field[0].type === 'checkbox'  ){
                    val = S.DOM.filter( field, ':checked' );
                }else{
                    val = field.val();
                }

                val = val ? val : '';
                if( maxlen && val.length > maxlen ){
                    this.setMsg('errmsg', '最多选择'+ maxlen +'个');
                    return false;
                }
                if( minlen && val.length < minlen ){
                    this.setMsg('errmsg', '最少选择'+ minlen +'个');
                    return false;
                }
                this.setMsg('sucmsg', '验证成功');

                return true;
            },
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
            password: function( field, bindName ){
                var val = field.val(),
                    bindVal = S.Node.all('[name='+ bindName + ']').val();

                if( bindVal != val ){
                    this.setMsg('errmsg', '密码不一致');
                    return false;
                }
            },
            ajax: function( field, Promise ){
                // var defer = new Promise.Defer(),
                var name = field.val(),
                    self = this,
                    isSuc = null;

                var cb = S.IO.get( "json.php", {
                        name: name
                    }, function( data ){
                        
                        if( data == 'ok'){

                            //验证成功，传送数据
                            self.setMsg('sucmsg', '用户名已注册');
                            isSuc = true;
                        }else{
                            
                            //验证失败，一样传送数据
                            self.setMsg('errmsg', '用户名未注册');
                            isSuc = false;
                        }
                    }, 'text'
                );
console.log(isSuc+" "+"----");
                return isSuc;

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