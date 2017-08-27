"use strict";

/*Подключение модулей*/
var gulp = require("gulp");
var less = require("gulp-less");

/*Дополнительный модуль. Он запирает все ошибки в себя, не останавливая работу скрипта*/
var plumber = require("gulp-plumber");

/*POSTCSS делает автопрефиксы*/
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

/*Модуль отображающий сайт в браузере*/
var server = require("browser-sync").create();

/*Оптимизация медиавыражений*/
var mqpacker = require("css-mqpacker");

/*Минификация CSS*/
var minify = require("gulp-csso");

/*Отдельный плагин для переименования файла*/
var rename = require("gulp-rename");

/*Оптимизируем изображения*/
var imagemin = require("gulp-imagemin");

/*Сборка SVG-спрайтов*/
var svgstore = require("gulp-svgstore");

/*Минификация SVG-файлов*/
var svgmin = require("gulp-svgmin");

/*Специальный плагин для последовательного запуска задач друг за другом.
Позволяет дождаться результата одного таска, затем запускает следующий*/
var run = require("run-sequence");

/*Модуль для удаления del*/
var del = require("del");

gulp.task("style", function() {      /*Описание таска*/
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())                     /*Прогоняем через компилятор Less*/
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))   /*Кидаем исходник в style.css*/
    .pipe(minify())           /*минифицируем style.css*/
    .pipe(rename("style.min.css")) /*вызываем переименование*/
    .pipe(gulp.dest("build/css"))   /*еще раз кидаем в style.css*/
    .pipe(server.stream());       /*Команда перезагрузки сервера в браузере*/
});

gulp.task("images", function() {
  /*Говорим откуда и какой контент мы берем*/
  /*берем любой .png, .jpg, .gif файл в любой подпапке папки img*/
  return gulp.src("build/img/*.{png,jpg,gif}")
    .pipe(imagemin([      /*imagemin сам по себе содержит в себе множество плагинов (работа с png,svg,jpg и тд)*/
      imagemin.optipng({optimizationLevel: 3}), /* 1 - максимальное сжатие, 3 - безопасное сжатие, 10 - без сжатия*/
      imagemin.jpegtran({progressive: true}),   /*прогрессивная загрузка jpg (сначала пиксельная, позже проявляется)*/
      ]))
  /*Говорим куда мы его складываем (в папку img)*/
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())       /*Минифицируем SVG*/
    .pipe(svgstore({      /*Вырезает из SVG-файлов лишнюю инф-цию*/
      inLineSvg: true
    }))
    .pipe(rename("symbols.svg")) /*нужно переименовать, так как мы не снаем имя спрайта*/
    .pipe(gulp.dest("build/img"));
});

  /*Перед тем как таск serve стартует должен быть запущен style*/
gulp.task("serve", function() {
  server.init({          /*инициируем сервер*/
    server: "build/",         /*говорим откуда смотреть сайт ( . - текущий каталог)*/
  });
  /*Ватчеры следящие за изменениями наших файлов*/
  /*Препроцессорные ватчеры (следим за всеми less файлами во всех папках внутри папки less),
   вторым аргументом передаем какой таск нужно запустить если один из файлов запустился*/
  gulp.watch("less/**/*.less", ["style"]);
  /*Слежение за HTML файлами в корне проекта*/
  gulp.watch("*.html", ["html:update"]);
});

/*Таск для копирования*/
gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
    ], {
      /*gulp по умолчанию раскрывает путь до первых *(звездочек).
       Говорим что базовый путь начинается из корня*/
      base: "."
    })
  .pipe(gulp.dest("build"));
});

/*Таск для удаления*/
gulp.task("clean", function() {
  return del("build");
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

/*Таск запуска*/
gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "symbols",
    fn  /*Самым последним вызовов функции run должна быть функция которая была передана как аргумент*/
  );
});


// Оптимизация на Grunt

// npmjs.com/package/css-mqpacker  - объединяет медиавыражения

// npmjs.com/package/grunt-csso - минификатор

// npmjs.com/package/grunt-contrib-imagemin - минификация изображений

// Оптимизация на gulp

// npmjs.com/package/css-mqpacker

// npmjs.com/package/gulp-csso - минификатор

// npmjs.com/package/gulp-imagemin - минификация изображений

// npmjs.com/package/gulp-svgstore - сборка SVG-спрайта
/*gulp symbols - команда*/
