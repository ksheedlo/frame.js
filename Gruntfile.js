module.exports = function (grunt) {
  var LICENSE;

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  LICENSE = '/** @license\n' +
            ' * <%= pkg.name %> v<%= pkg.version %>\n' +
            ' * Copyright (c) 2013 Ken Sheedlo. http://kensheedlo.com\n' +
            ' * License: MIT\n' +
            ' *\n' +
            ' * Made with love in Colorado by @kensheedlo\n' +
            ' */\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),
    concat: {
      dist: {
        options: {
          banner: LICENSE + "(function (window, undefined) {\n'use strict';\n",
          process: function (src) {
            return src
              .replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1')
              .replace(/\/\*\s*(global|exported)\s+.*\*\/\s*/g, '');
          },
          footer: "\n})(window);"
        },
        src: ['src/**/*'],
        dest: 'dist/frame.js'
      }
    },
    jshint: {
      files: ['src/**/*.js', 'test/**/*.js'],
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        newcap: true,
        undef: true,
        unused: true,
        trailing: true,
        globalstrict: true
      }
    },
    uglify: {
      dist: {
        options: {
          report: 'min',
          beautify: {
            beautify: false,
            max_line_len: 500
          },
          sourceMap: 'dist/frame.min.js.map',
          sourceMappingURL: 'frame.min.js.map',
          preserveComments: 'some'
        },
        files: {
          'dist/frame.min.js': ['dist/frame.js']
        }
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      unit: {},
      allunit: {
        browsers: ['Chrome', 'Firefox', 'Safari', 'ChromeCanary', 'Opera']
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('package', ['concat', 'uglify']);
  grunt.registerTask('default', ['test', 'package']);
};
