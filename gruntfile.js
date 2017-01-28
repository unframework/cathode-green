module.exports = function (grunt) {
	'use strict';

    grunt.initConfig({
        watch: {
            styles: {
                files: ['src/{,*/}*.less'],
                tasks: ['less:development']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '{,*/}*.html',
                    '.tmp/src/{,*/}*.css',
                    'src/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        connect: {
            options: {
                port: 9001,
                hostname: '*',
                livereload: 35730
            },
            livereload: {
                options: {
                    open: 'http://localhost:9001',
                    base: [
                        '.tmp',
                        '.'
                    ]
                }
            }
        },

        less: {
            development: {
                files: {
                    '.tmp/src/main.css': 'src/main.less'
                }
            },
            dist: {
                files: {
                    'src/main.css': 'src/main.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'less:development',
        'connect:livereload',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'less:dist'
    ]);
};