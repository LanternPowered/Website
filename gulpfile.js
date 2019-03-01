const gulp = require('gulp');
const toml = require('toml');
const mkdirp = require('mkdirp');
const lazyValue = require('lazy-value');
const fs = require('fs'); // File System

// A function to execute processes on a specific file
const exec = require('child_process').execFile;
// The hugo package
const hugo = require('hugo-bin');
 
// Real favicon generator
const favicon = require('gulp-real-favicon');

const hugoConfig = lazyValue(readConfig);
const publishDir = lazyValue(() => (hugoConfig['publishDir'] || 'public') + '/');
const staticDir = lazyValue(() => (hugoConfig['staticDir'] || 'static') + '/');

/**
 * Reads the config file.
 *
 * This config file is normally only used for Hugo, but this is expanded
 * to generate other assets.
 *
 * @returns The parsed config
 */
function readConfig() {
    return toml.parse(fs.readFileSync('config.toml', 'utf8'));
}

/**
 * Executes a Hugo task with the given arguments and callback.
 *
 * @param args The arguments
 * @param done The callback when the task is finished
 */
function execHugoTask(args, done) {
    // Execute the hugo task
    const process = exec(hugo, args, err => done(err));
    // Redirect all the logging data so we can see it in the console
    process.stdout.on('data', data => console.info(data));
    process.stderr.on('data', data => console.error(data));
}

// Start the hugo server task
gulp.task('dev', done => execHugoTask(['server'], done));

// Start the hugo build task
gulp.task('build', done => {
    execHugoTask([], done)
});

// Print the hugo version
gulp.task('hugo:version', done => execHugoTask(['version'], done));

// Generate github related configuration files.
gulp.task('github-setup', function (done) {
    const data = readConfig();
    // Generate the CNAME file
    fs.writeFileSync(publishDir() + 'CNAME', data['baseURL'].replace(/https?:\/\//, ''));
    // Generate the config file to define the 404 page file.
    fs.writeFileSync(publishDir() + '_config.yaml', 'permalink: /404.html\n');
    done();
});

const faviconDataFile = 'faviconData.json';

// Generate/update the favicon header info partial.
gulp.task('favicon:generate-header-info', function() {
    require('./favicon_config');
    const faviconInfoDir = 'layouts/partials/';
    if (!fs.existsSync(faviconInfoDir)) mkdirp.sync(faviconInfoDir);
    const faviconInfo = faviconInfoDir + config['partial'];
    // Regenerate the file with a informational header.
    fs.writeFileSync(faviconInfo, '<!-- Do not modify the favicon information manually. -->\n');
    // Inject favicon data into the generated file.
    return gulp.src(faviconInfo)
        .pipe(favicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(faviconDataFile)).favicon.html_code))
        .pipe(gulp.dest(faviconInfoDir))
});

// Generate the icons. This task takes a few seconds to complete.
gulp.task('favicon:generate', function(done) {
    require('./favicon_config');
    const logo = config['logo'];

    config['masterPicture'] = config['masterPicture'] || staticDir() + logo;
    if (!config['dest']) {
        const index = logo.lastIndexOf('/');
        const dir = logo.substring(0, index) + '/favicon';
        config['dest'] = index === -1 ? '' : staticDir() + dir;
        config['iconsPath'] = config['iconsPath'] || '/' + dir;
    } else {
        config['iconsPath'] = config['iconsPath'] || '/';
    }
    config['settings'] = config['settings'] || {
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false,
        readmeFile: false,
        htmlCodeFile: false,
        usePathAsIs: false
    };
    config['markupFile'] = faviconDataFile;

    favicon.generateFavicon(config, done);
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
gulp.task('favicon:check-for-update', function(done) {
    const currentVersion = JSON.parse(fs.readFileSync(faviconDataFile)).version;
    favicon.checkForUpdates(currentVersion, function(err) {
        if (err) throw err;
        done()
    });
});

// Run all favicon tasks
gulp.task('favicon', gulp.series(
    'favicon:generate',
    'favicon:generate-header-info'
));

// The default tasks for building
gulp.task('default', gulp.series('favicon', 'build', 'github-setup'));
