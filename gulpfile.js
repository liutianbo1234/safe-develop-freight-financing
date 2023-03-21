var gulp = require('gulp');
var uglify = require("gulp-uglify");
var inlinesource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin'); //压缩html
var notify = require('gulp-notify');   //提示
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');   //文件重命名
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var srcs = {
    'js': ['./abroad/assets/**/*'],
    'inlinesource': ['./abroad/src/views/**/*.html'],
    'copy':['./abroad/extends/**/*'],
    'reduxCopy':['./abroad/redux/**/*'],
    'copyImage':['./abroad/layui/**/*'],
    'static':['./abroad/static/img/*'],
    'zTreeStyle':['./abroad/zTreeStyle/**/*'],
    'minifycss':['./abroad/src/css/*.css'],
    'index':['./abroad/index.html']
}

gulp.task('javascript', function (done) {gulp.src(srcs.js)
    .pipe(uglify())  //压缩
    .pipe(gulp.dest('./dist/assets'))
    .pipe(notify({message:'js打包成功'}));   //提示成功
    done()
})

gulp.task('inlinesource', function () {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        minfyJS: true,//压缩JS
        minfyCss: true,//压缩CSS
    };
    return  gulp.src(srcs.inlinesource)
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./dist/src/views'))
        .pipe(notify({message:'html task ok'}));   //提示成功
});


gulp.task('copy', function (done) {gulp.src(srcs.copy)
    .pipe(uglify())  //压缩
    .pipe(gulp.dest('dist/extends'))
    done()
})
gulp.task('reduxCopy', function (done) {gulp.src(srcs.reduxCopy)
    .pipe(gulp.dest('dist/redux'))
    .pipe(notify({message:'redux拷贝成功'}));
    done()
})
gulp.task('copyImage', function (done) {gulp.src(srcs.copyImage)
    .pipe(gulp.dest('dist/layui'))
    done()
})

gulp.task('testImagemin', function (done) {
     gulp.src(srcs.static)
         .pipe(imagemin({
             optimizationLevel: 5,// 取值范围：0-7（优化等级），默认：3
             progressive: true,// 无损压缩jpg图片，默认：false
             interlaced: true, 	// 隔行扫描gif进行渲染，默认：false
             svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
             use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
         }))
         .pipe(gulp.dest("dist/static/img"))
         .pipe(notify({message:'图片添加成功'}))  //提示成功;
         done()
 })

gulp.task('zTreeStyle', function (done) {gulp.src(srcs.zTreeStyle)
    .pipe(gulp.dest('dist/zTreeStyle'))
    done()
})
gulp.task('minifycss',function(){
    return gulp.src(srcs.minifycss)      //设置css
        .pipe(minifycss())                    //压缩文件
        .pipe(gulp.dest('dist/src/css'))            //输出文件目录
        .pipe(notify({message:'css打包成功'}));   //提示成功
 });
 gulp.task('index',function(){
    return gulp.src(srcs.index)
    .pipe(notify({message:'主页面成功'}))
    .pipe(gulp.dest('dist/'))
 });
gulp.task('default', gulp.series('javascript','inlinesource','copy','minifycss','copyImage','testImagemin','zTreeStyle','reduxCopy','index', function (done) {
   done()
}));
