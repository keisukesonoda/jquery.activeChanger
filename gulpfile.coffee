'use strict'
# settings
# --------------------
dir =
	app:    'app'
	src:    'src'
	dest:   'build'
	coffee: 'coffee'
	js:     'js'
	sass:   'sass'
	css:    'css'
	img:    'images'


path =
	src:
		root:   "#{dir.app}/#{dir.src}"
		coffee: "#{dir.app}/#{dir.src}/#{dir.coffee}"
		js:     "#{dir.app}/#{dir.src}/#{dir.js}"
		sass:   "#{dir.app}/#{dir.src}/#{dir.sass}"
		css:    "#{dir.app}/#{dir.src}/#{dir.css}"
		img:    "#{dir.app}/#{dir.src}/#{dir.img}"
	dest:
		root:   "#{dir.app}/#{dir.dest}"
		coffee: "#{dir.app}/#{dir.dest}/#{dir.coffee}"
		js:     "#{dir.app}/#{dir.dest}/#{dir.js}"
		sass:   "#{dir.app}/#{dir.dest}/#{dir.sass}"
		css:    "#{dir.app}/#{dir.dest}/#{dir.css}"
		img:    "#{dir.app}/#{dir.dest}/#{dir.img}"

js =
	concats: [
		'jquery.activeChanger'
	]

css =
	files: [
		'jquery.activeChanger'
	]


# common requires
# --------------------
gulp    = require 'gulp'
plumber = require 'gulp-plumber'



# server
# --------------------
browser = require 'browser-sync'

gulp.task 'server', ->
	browser({
		server:
			baseDir: "#{path.src.root}",
		port: 8000,
		open: false,
	})



# sass
# --------------------
sass         = require 'gulp-sass'
autoprefixer = require 'gulp-autoprefixer'

gulp.task 'sass', ->
	sassfiles = []
	for file in css.files
		sassfiles.push "#{path.src.sass}/"+file+'.scss'

	gulp.src sassfiles
			.pipe plumber()
			.pipe sass({
				outputStyle: 'expanded'
			}).on('error', sass.logError)
			.pipe autoprefixer({
				browsers: [
					'last 2 versions'
					'ie >= 10'
					'Android >= 4.1'
					'ios_saf >= 7'
				]
				cascade: false
				})
			.pipe gulp.dest "#{path.src.css}"
			.pipe browser.reload({ stream: true })


# coffee
# --------------------
coffee = require 'gulp-coffee'
gutil  = require 'gulp-util'

gulp.task 'coffee', ->
	gulp.src "#{path.src.coffee}/*.coffee"
			.pipe plumber()
			.pipe coffee({
				bare: true
			}).on('error', gutil.log)
			.pipe gulp.dest "#{path.src.js}"
			.pipe browser.reload({ stream: true })


# reload
# --------------------
gulp.task 'reload', ->
	gulp.src "./"
			.pipe browser.reload({ stream: true })


# watch
# --------------------
gulp.task 'watch', ->
	gulp.watch "#{path.src.coffee}/*.coffee", ['coffee']
	gulp.watch "#{path.src.sass}/**", ['sass']
	gulp.watch "#{path.src.root}/*.html", ['reload']


# default task
# --------------------
gulp.task 'default', ['server', 'watch'], ->




# build
# --------------------
del    = require ('del')
copy   = require 'gulp-copy'
usemin = require 'gulp-usemin'
cssmin = require 'gulp-cssmin'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'


gulp.task 'init', (cb) ->
	del "#{path.dest.root}", cb


gulp.task 'copy', ['init'], ->
	gulp.src "#{path.src.root}/**", { base: "#{path.src.root}" }
			.pipe gulp.dest "#{path.dest.root}"


gulp.task 'min', ['copy'], ->
	# 連結してminify
	gulp.src "#{path.dest.root}/index.html"
			.pipe usemin({
				js_vendor: [ uglify() ]
				css_pc: [ cssmin() ]
				css_sp: [ cssmin() ]
			})
			.pipe gulp.dest "#{path.dest.root}"


gulp.task 'clean', ['min'], (cb) ->
	delfiles = []
	for file in js.concats
		# delfilesにconcat元ファイルを追加
		delfiles.push "#{path.dest.js}/"+file+'.js'
	for file in css.files
		# delfilesにminify前のcssファイルを追加
		delfiles.push "#{path.dest.css}/"+file+'.css'
	# coffeeとsassも追加
	delfiles.push "#{path.dest.coffee}"
	delfiles.push "#{path.dest.sass}"
	console.log delfiles
	# clean実行
	del delfiles, cb


gulp.task 'build', ['clean'], ->
	console.log 'build finish'
