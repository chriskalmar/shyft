
'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'test/setup.js',
          clearRequireCache: true
        },
        src: [
          'test/**/*.js'
        ]
      },
    },


    watch: {
      js: {
        options: {
          spawn: false,
        },
        files: [
          '*.js',
          '**/*.js',
          '!node_modules/**',
          '!coverage/**'
        ],
        tasks: [
          'newer:eslint',
          'newer:mochaTest'
        ]
      }
    },


    eslint: {
      js: {
        options: {
          configFile: '.eslintrc.json'
        },
        src: [
          '**/*.js',
          '!node_modules/**',
          '!coverage/**'
        ]
      }
    }

  });



  // make sure only changed files get linted
  grunt.event.on('watch', function(action, filepath) {
    grunt.config('eslint.js.src', filepath);
  });


  grunt.registerTask('default', [ 'eslint', 'mochaTest' ]);
};
