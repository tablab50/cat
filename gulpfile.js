import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import plumber from 'gulp-plumber';
import *as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import sync from 'browser-sync';
import rename from 'gulp-rename';
import csso from 'postcss-csso';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import sourcemap from 'gulp-sourcemaps';
import clear from 'gulp-clean';
// Styles

 export const styles =  async () => {
   gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

// HTMl
 const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

//Copy
 export const copyFiles = (done)  => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.svg",
    "!source/img/icons/*.svg",
    "source/*.webmanifest"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
  done();
 }

  // Scripts
  const scripts = () => {
    return gulp.src("source/js/scripts.js")
      .pipe(terser())
      .pipe(rename("script.min.js"))
      .pipe(gulp.dest("build/js"))
      .pipe(sync.stream());
  }
  // Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/script.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
}
// Reload
const reload = (done) => {
  sync.reload();
  done();
}

// Images
 export const  optimizeImages = () => {
  return gulp.src('source/img/**/*{')
    .pipe(squoosh())
    .pipe(gulp.dest("build/img"))
}


export const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
  .pipe(gulp.dest('build/img'))
}
// Webp
export const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest('build/img'))
}

// Sprite
export const sprite = () => {
  return gulp.src('source/img/icons/*')
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'))
}

// Clean
export const clean = async () => {
  return clear('build');
}

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
// Build

   export const build = gulp.series(
  clean,
  copyFiles,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  ),
);
// Default


export default gulp.series(
  clean,
  copyFiles,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));

