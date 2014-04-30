/**
 * 表单验证
 * mvvm
 * @time: 2014-4-16
 * @file: regexp
 * @author: bigwind
 */
/*
 * html attribute
 * regexp: { boolean }
 * regexp: { object }
 * function: { array }
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
                errmsg: '必填'
            },
            email: { 
                reg: /^([a-zA-Z0-9\_\-\.])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/, 
                errmsg: '邮箱格式不正确'
            },
            // txt: [ /^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w ]*))+\.(txt|TXT)$/, ['只能是txt文件']],
            txt: { 
                reg: /\.(txt|TXT)$/, 
                errmsg: '只能是txt文件'
            },
            maxLength: function( length, val ){
                if( val.length > length ){
                    return {
                        status: true,
                        msg: '最大长度不能超过' + length
                    }
                } 
            },
            //size unit { KB }
            fileSize: function( size, userFile ){
                var filesize = 0;

                if( UA.webkit || UA.gecko ){ 
                    filesize = this[0].files[0].size;  
                }else if( UA.trident ){  
                    var obj_img = document.getElementById('tempimg');  
                    obj_img.dynsrc = this[0].value;  
                    filesize = obj_img.fileSize;  
                }else{  
                    return {
                        status: true,
                        msg: "无法获取文件大小，文件小于"+ size +'K'
                    };
                }
                filesize = ( filesize / 1024 );

                if( filesize > size ){
                    return {
                        status: true,
                        msg: '上传文件不能大于'+ size +'K'
                    };
                }
            }
        }
});