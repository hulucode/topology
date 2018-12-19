/**
 * Created by wangshouyun on 2016/10/29.
 */

var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var gulpWebpack = require('gulp-webpack');
var webpackConfig = require("./webpack.config.js");


gulp.task("webpack-dev-server", function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: "/" + myConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(7777, "localhost", function (err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:7777/webpack-dev-server/index.html");
    });
});

gulp.task('build', function () {
    return gulp.src('')
        .pipe(gulpWebpack(webpackConfig))
        .pipe(gulp.dest('./dest'));
});

