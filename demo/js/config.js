/**
 * =-------------------------------------------------------------------------=
 * config.js
 * =-------------------------------------------------------------------------=
 *
 * Cute UI 组件库配置
 *
 * @author	qianwei.xqw
 * @date	2013-08-11
 */
(function(S){
	'use strict';

	var scripts = document.getElementsByTagName('script'),
		reg = /((?:\d+[.]){2}\d+)\/js\/config.js/,
		i, len, VERSION;

	// 获取版本号
	for(i = 0, len = scripts.length; i < len; i++){
		var arr = scripts[i].src.match(reg);
		
		if(arr && arr[1]){
			// 版本号
			VERSION = arr[1];
		}
		VERSION = "1.2.6"
	}
	
	S.config({
		packages:[
			{
				// 包名
				name: "cute",

				// 包的基准路径
				path: 'http://g.tbcdn.cn/sd/cute/' + VERSION + '/js',

				ignorePackageNameInUri: true,

				 // 包里模块文件编码格式
				charset: 'utf8'
			}
		]
	});

	// 暴露全局变量
	window.CUTE = window.CUTE || {};

	// 包配置封装
	CUTE.package = function(packageName, packageVersion){
        S.config({
            packages:[
                {
					// 包名
					name: packageName,

                    // 包的基准路径
                    path: 'http://g.tbcdn.cn/sd/' + packageName + '/' + packageVersion + '/js',

                    ignorePackageNameInUri: true,

                    // 包里模块文件编码格式
                    charset: 'utf8'
                }
			]
        });
	}

	//
	// 依赖的js
	// 
	// html5 ie hack 不能异步引入，临时放在这里
	document.createElement('header');
	document.createElement('section');
	document.createElement('footer');
	// S.use('cute/_lib/ie-hack.js');
})(KISSY);
