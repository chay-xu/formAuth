module.exports = function(grunt) {
    var configs = grunt.file.readJSON('package.json');
    var BUILD = 'build/';
    var versionPath = '1.0/';
    var kmcSrcs = [
        'index.js',
        'formViweModle.js',
        'formModle.js',
        'formViwe.js'
    ];
    var kmcMain = [];
    for(var i = 0;i<kmcSrcs.length;i++){
        var buildPath = versionPath + BUILD + kmcSrcs[i];
        kmcMain.push({
            src: versionPath+kmcSrcs[i],
            dest: buildPath
        });
    }

    grunt.initConfig({
        // 配置文件，参考package.json配置方式，必须设置项是
        // name, version, author
        // name作为gallery发布后的模块名
        // version是版本，也是发布目录
        // author必须是{name: "xxx", email: "xxx"}格式
        pkg: configs,
        buildBase: '1.0/build',
        banner: '/*!build time : <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>*/\n',
        // 对build目录进行清理
        clean: {
            build: {
                src: '<%= pkg.version %>/build/*'
            }
        },
        // kmc打包任务，默认情况，入口文件是index.js，可以自行添加入口文件，在files下面
        // 添加
        kmc: {
            options: {
                banner: '<%= banner %>',
                packages: [
                    {
                        name: '<%= pkg.name %>',
                        path: '../'
                    }
                ],
                map: [["<%= pkg.name %>/", "gallery/<%= pkg.name %>/"]]
            },
            main: {
                files: kmcMain
            }
        },
        copy: {
            main: {
                files: [
                    {src: ['path/**'], dest: 'dest/'}
                ]
            }
        },
        /**
         * 对JS文件进行压缩
         * @link https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                banner: '<%= banner %>',
                beautify: {
                    ascii_only: true
                }
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '1.0/',
                        src: ['**/*.js', '!**/*-min.js'],
                        dest: '<%= buildBase %>',
                        ext: '-min.js'
                    }
                ]
            }
        },
        less: {
            options: {
                banner: '<%= banner %>'
            },
            themes:{
                files: []
            }
        },
        cssmin: {
            options: {
                banner: '<%= banner %>'
            },
            themes:{
                files: [
                    {
                        expand: true,
                        cwd: '<%= buildBase %>',
                        src: ['**/*.css', '!**/*-min.css'],
                        dest: '<%= buildBase %>',
                        ext: '-min.css'
                    }
                ]
            }
        },
        // 本地服务器
        // 文档 https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            devServer: {
                options: {
                    port: 8000,
                    hostname: '127.0.0.1',
                    base: './',
                    keepalive: true,
                    middleware: function (connect, options) {
                        return [
                            // Serve static files.
                            connect.static(options.base),
                            // Make empty directories browsable.
                            connect.directory(options.base),
                        ];
                    }
                }
            },
            testServer: {}
        }
    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-kmc');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-connect'); // 本地服务器

    return grunt.registerTask('default', ['kmc', 'uglify','less','cssmin']);
};