var gulp          = require('gulp'), //Підключаємо Gulp (npm i gulp --save-dev)
     sass         = require('gulp-sass'), // Підключаємо Sass пакет
     browserSync  = require('browser-sync'), // Підключаємо Browser Sync
     concat       = require('gulp-concat'), //Підключаємо gulp-concat (для конкатинації файлів)
     uglify       = require('gulp-uglifyjs'), //Підключаємо gulp-uglifyjs (для стискання JS) 
     cssnano      = require('gulp-cssnano'), //Підключаємо пакет для мінімізації CSS
     rename       = require('gulp-rename'), //Підключаємо бібліотеку для перейменування файлів
     del          = require('del'), //Підключаємо бібліотеку для видалення файлів і папок
     imagemin     = require('gulp-imagemin'), //Підключаємо бібліотеку для роботи з зображеннями
     pngquant     = require('imagemin-pngquant'), //Підключаємо бібліотеку  для роботи з png
     cache        = require('gulp-cache'), //Підключаємо бібліотеку кешування
     autoprefixer = require('gulp-autoprefixer'), //Підключаємо бібліотеку для авоматичного додавання префіксів
     pug          = require('gulp-pug'); //Підключаємо PUG

gulp.task('pug',function(){
   return gulp.src('app/pug/doc.pug')
   .pipe(pug({pretty: true}))
   .pipe(gulp.dest('app/'))
});
gulp.task('sass', function () { // Створюємо таск "sass"
   return gulp.src('app/sass/main.sass') //Беремо файл з app/sass   
   .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // Перетворимо Sass в CSS за допомогою gulp-sass
   .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true})) //Створюємо префікси
   .pipe(gulp.dest('app/css')) //Вивантажуємо результат в папку app/css
   .pipe(browserSync.reload({stream: true})) //Обновляємо CSS на сторінці при її зміні
});
gulp.task('scripts', function () {
   return gulp.src([
      'app/libs/jquery/dist/jquery.min.js' //беремо jQuery
      ,'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' //беремо Magnific-Popup 
      ])
   .pipe(concat('libs.min.js')) //Збираємо в купу jQuery + Magnific-Popup
   .pipe(uglify()) //Ститкаємо наш  JS файл (libs.min.js)
   .pipe(gulp.dest('app/js')); //Вивантажуємо в папку app/js
   })

//зжиматиме бібліотеки
gulp.task('css-libs', ['sass'], function () {
   return gulp.src('app/css/libs.css') //Вибираємо файл для мінімізації
   .pipe(cssnano()) //Стискаємо його
   .pipe(rename({suffix: '.min'})) //Додаємо суфіх .min
   .pipe(gulp.dest('app/css')); //Вивантажуємо в папку app/css
});
////---Створюємо таск browser-sync---
gulp.task('browser-sync', function () {
   browserSync({ //Виконуємо browser-sync
      server: { //задаємо параметри сервера
         baseDir: 'app' //Директорія для сервера - app
      }
      , notify: false  //Відключаємо сповіщення
   });
});
gulp.task('clean', function () {
   return del.sync('dist')  //очищення папки dist перед зборкою
   });
//оптимізація зображень
gulp.task('img', function () {
   return gulp.src('app/img/**/*') //Беремо всі зображення з app
   .pipe(cache(imagemin({ //Стискаємо їх з найкращими налаштуваннями з врахуванням кешування
         interlaced: true
         , progressive: true
         , svgoPlugins: [{
            removeViewBox: false
         }]
         , use: [pngquant()]
      })))
      .pipe(gulp.dest('dist/img')) //Вивантажуємо продакшн
   });

///WATCH
//   //другий параметр -масив в якому вказуємо таски які потрібно виконати до запуску таска watch ['browser-sync', 'css-libs', 'scripts']
gulp.task('watch',['browser-sync','css-libs','scripts'],function () {
   gulp.watch('app/sass/**/*.sass', ['sass']); //Спостереження за sass файлами в папці sass
   gulp.watch('app/pug/**/*.pug',['pug']);
   gulp.watch('app/*.html', browserSync.reload); //Спостереження за HTML файлами в корені проекта
   gulp.watch('app/js/**/*.js', browserSync.reload); //Спостереження за JS файлами в папці JS   
})
//--BUILD-- зборка
//в масиві передаємо таки які повинні виконатись перед зборкою
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
   var buildCSS = gulp.src([ //Переносимо бібліотеки в продакшн 
      'app/css/main.css'
      , 'app/css/libs.min.css'
      , 'app/css/reset.css'
   ])
   .pipe(gulp.dest('dist/css'));
   var buildFonts = gulp.src('app/fonts/**/*') //Переносимо шрифти в продакшн 
   .pipe(gulp.dest('dist/fonts'));
   var buildJS = gulp.src(['app/js/**/*']) //Переносимо скріпти в продакшн 
   .pipe(gulp.dest('dist/js'));
   var buildHTML = gulp.src('app/*.html') //Переносимо HTML в продакшн 
   .pipe(gulp.dest('dist'))
})
//очитка кешу
gulp.task('clear', function () {
      return cache.clearAll();
   })
 