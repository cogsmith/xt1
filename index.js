const fs = require('fs');
const path = require('path');

const util = require('util');
const wait = util.promisify(setTimeout);

const _ = require('lodash');
const pino = require('pino');
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const nunjucks = require('nunjucks');

const fastify = require('fastify');
const fastify_compress = require('fastify-compress');
const fastify_static = require('fastify-static');
const fastify_pov = require('point-of-view');

//

const NOP = function () { };
let LOG = NOP; LOG.FATAL = NOP; LOG.TRACE = NOP; LOG.DEBUG = NOP; LOG.INFO = NOP; LOG.WARN = NOP; LOG.ERROR = NOP;
const LOGCONSOLE = console.log; LOG.TRACE = LOGCONSOLE; LOG.DEBUG = LOGCONSOLE; LOG.INFO = LOGCONSOLE; LOG.WARN = LOGCONSOLE; LOG.ERROR = LOGCONSOLE; LOG = LOGCONSOLE;

const YARGY = yargs(process.argv).help(false).version(false)
    .usage("\n" + 'USAGE: node $0 [options]')
    .group('loglevel', 'Log').describe('loglevel', 'Log Level').default('loglevel', 'info')
    .group('logfancy', 'Log').describe('logfancy', 'Log Fancy').default('logfancy', false)
    .group('ip', 'Backend').describe('ip', 'Backend Bind IP').default('ip', process.env.HOST || '127.0.0.1')
    .group('port', 'Backend').describe('port', 'Backend Bind Port').default('port', process.env.PORT || 80);
const YARGS = YARGY.argv;

//

const XT = {};

XT.NOP = NOP;
XT.Wait = wait;

XT.Log = { Logger: NOP };
XT.LOG = XT.Log.Logger;

XT.App = {};
const App = XT.App;

//

XT.InitMeta = function () {
    XT.Package = require('./package.json');
    XT.Meta = _.merge(XT.Package, {
        Version: XT.Package.version || process.env.npm_package_version || '0.0.0',
        Name: XT.Package.namelong || XT.Package.name || 'XT',
        NameTag: XT.Package.nametag || XT.Package.name.toUpperCase(),
        Info: XT.Package.description || ''
    });
    XT.Meta.Full = XT.Meta.Name + ': ' + XT.Meta.Info + ' [' + XT.Meta.Version + ']';

    const AppPath = process.cwd();
    const AppPackage = fs.existsSync(AppPath + '/' + 'package.json') ? require(AppPath + '/' + 'package.json') : {};
    const AppMeta = _.merge(AppPackage, { Info: AppPackage.description || '' });
    AppMeta.Version = AppPackage.version || process.env.npm_package_version || '0.0.0';
    AppMeta.Name = AppPackage.namelong || AppPackage.name || process.env.CELLTAG || path.basename(AppPath).toUpperCase() || 'APP';
    AppMeta.NameTag = AppPackage.nametag || process.env.CELLTAG || AppPackage.Name || 'APP';
    AppMeta.Full = AppMeta.Name + ': ' + AppMeta.Info + ' [' + AppMeta.Version + ']';
    AppMeta.Path = AppPath;

    App.Package = AppPackage;
    App.Meta = AppMeta;
}

//

XT.Log.SetLevel = function (level) {
    let log = XT.LOG;
    log.level = level || 'trace';
    if (log.level == 'fatal') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = NOP; log.ERROR = NOP; }
    if (log.level == 'error') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = NOP; log.ERROR = log.error; }
    if (log.level == 'warn') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'info') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'debug') { log.TRACE = NOP; log.DEBUG = log.debug; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'trace') { log.TRACE = log.trace; log.DEBUG = log.debug; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    return log.level;
}

XT.Log.Pretty = {
    colorize: true,
    singleLine: true,
    ignore: 'hostname,pid',
    translateTime: 'SYS:yyyy-mm-dd|HH:MM:ss',
    messageFormat: function (log, key, label) {
        let msg = log.msg ? log.msg : '';
        let logout = chalk.gray(App.Meta.NameTag);
        if (msg != '') { logout += ' ' + msg };
        return logout;
    }
}

XT.Log.GetLogger = function () {
    let logger = pino({
        level: YARGS.loglevel || 'trace',
        prettyPrint: (YARGS.logfancy == 0) ? false : XT.Log.Pretty,
        hooks: {
            logMethod: function (args, method) {
                if (args.length === 2) { args.reverse() }
                method.apply(this, args);
            }
        },
    });
    return logger;
}

//

XT.InitLogger = function () {
    // XT.LOG = XT.Log; const LOG = XT.Log; LOG.TRACE = LOG.trace; LOG.DEBUG = LOG.debug; LOG.INFO = LOG.info; LOG.WARN = LOG.warn; LOG.ERROR = LOG.error; LOG.FATAL = LOG.fatal;    
    LOG = XT.LOG = XT.Log.Logger = XT.Log.GetLogger();
    XT.Log.SetLevel(YARGS.loglevel || 'trace');
}

XT.InitProcess = function () {
    process.setMaxListeners(999); require('events').EventEmitter.prototype._maxListeners = 999;
    process.on('uncaughtException', function (err) { console.log("\n"); console.log(err); console.log("\n"); process.exit(1); }); // throw(Error('ERROR'));
    process.onSIGTERM = function () { console.log('SIGTERM'); process.exit(); }; process.on('SIGTERM', function () { process.onSIGTERM(); });
}

XT.Init = function () {
    XT.InitMeta();
    XT.InitLogger();
    XT.InitProcess();
    XT.InitApp();
    XT.InitAppInfo();
    return XT;
}

XT.InitAppInfo = function () {
    App.InfoDB = {};
    App.SetInfo('Node.Args', process.argv.join(' '));
    App.SetInfo('Node', require('os').hostname().toUpperCase() + ' : ' + process.pid + '/' + process.ppid + ' : ' + process.cwd() + ' : ' + process.version + ' : ' + require('os').version() + ' : ' + process.title);
    App.SetInfo('App', App.Meta.Full);
}

XT.InitApp = function () {
}

//

App.Exit = function (z, data) {
    let exit = { code: 0, error: false, silent: false, message: 'App.Exit' };
    if (z && z.stack) {
        exit.code = 1;
        exit.error = z;
        exit.msg = 'App.Exit ' + chalk.white(z.message);
        z.message = exit.msg;
        LOG.ERROR(z);
        LOG.ERROR(exit.msg, _.merge({ ExitCode: exit.code }, data));
    }
    else {
        if (Number.isInteger(z)) { exit.code = z; }
        else if (typeof (z) == 'string') { exit.message = 'App.Exit ' + chalk.white(z); }
        else if (z) { exit = z; }
        if (!exit.error) { delete exit.error; }
        if (!exit.silent) { LOG.INFO(exit.message, _.merge(exit, data)); }
    }
    process.exit(exit.code);
}

App.ExitSilent = function () { App.Exit({ silent: true }); }

//


App.Info = function (id) {
    let z = App.InfoDB[id];
    let info = false;
    if (!z) { info = z; }
    else {
        if (z.Type == 'FX') { info = z.Value.call(); }
        else { info = z.Value; }
    }
    return info;
};

App.SetInfo = function (id, value) {
    if (typeof (value) == 'function') { return App.InfoDB[id] = { Type: 'FX', Value: value } }
    else { return App.InfoDB[id] = { Type: 'VALUE', Value: value } }
};

//

App.InitBackendRoutes = function () {
    let urlbase = '';
    if (process.env.CELLBASE && process.env.CELLBASE != '@' && process.env.CELLBASE != '/') { urlbase = '/' + process.env.CELLBASE; }
    if (App.RoutesBase) { urlbase = App.RoutesBase; }

    let backend_methods = 'HEAD GET PUT POST PATCH DELETE OPTIONS'.split(' ');
    backend_methods = 'HEAD GET PUT POST DELETE'.split(' ');
    backend_methods = 'GET POST'.split(' ');

    let backend = require('fastify')({
        logger: XT.Log.Logger,
        maxParamLength: 999,
        ignoreTrailingSlash: true,
    });

    backend.register(require('fastify-compress'));

    backend.register(require('fastify-static'), {
        root: process.cwd() + '/www',
        prefix: urlbase
    })

    let NJCONFIG = {
        tags: {
            blockStart: '[[',
            blockEnd: ']]',
            variableStart: '[=',
            variableEnd: '=]',
            commentStart: '[#',
            commentEnd: '#]'
        }
    }

    backend.register(require('point-of-view'), {
        engine: { nunjucks: nunjucks },
        options: {
            onConfigure: nj => {
                console.log(nj.opts);
                nj.opts.tags = NJCONFIG.tags;
            }
        },
        templates: './views',
        viewExt: 'html',
        includeViewExtension: true
    })

    backend.addHook('onRequest', (req, rep, nxt) => {
        let reqip = req.socket.remoteAddress;
        //App.Requests++; if (!App.Clients[reqip]) { App.Clients[reqip] = 1; } else { App.Clients[reqip]++; }
        nxt();
    });

    // backend.get('/', function (req, rep) { rep.send('XT'); });

    if (App.Routes) {
        LOG.DEBUG('App.Routes: ' + ((urlbase == '') ? '/' : urlbase));

        let routekeys = Object.keys(App.Routes).sort();
        for (let i = 0; i < routekeys.length; i++) {
            let rkey = routekeys[i];
            let rfx = App.Routes[rkey];
            if (rkey.startsWith('/') || rkey.startsWith('*')) {
                LOG.TRACE('Backend.Route: ' + rkey);
                backend.route({ method: backend_methods, url: urlbase + rkey, handler: rfx });
            }
            else {
                if (rkey == 'ELSE' && rfx) {
                    if (!App.Routes['*']) {
                        LOG.TRACE('Backend.Route: ' + rkey);
                        backend.route({ method: backend_methods, url: '*', handler: rfx });
                    }
                }
            }
        }

        if (!App.Routes['*'] && !App.Routes.ELSE && App.Routes.ELSEROOT) {
            LOG.TRACE('Backend.Route: ELSEROOT');
            let rfx = (req, rep) => {
                console.log(urlbase);
                console.log(req.url);
                let checkurl = '/'; if (urlbase != '') { checkurl = urlbase; }
                if (req.url != checkurl) { rep.redirect(checkurl); }
                else { rep.code(404).send(); }
            };
            backend.route({ method: backend_methods, url: '*', handler: rfx });
        }

        //if (App.Routes['*']) { backend.setNotFoundHandler(App.Routes.NOTFOUND); }
        //else { backend.setNotFoundHandler((req, rep) => { rep.code(404).send(); }); }

        if (App.Routes['NOTFOUND']) { backend.setNotFoundHandler(App.Routes.NOTFOUND); }
        else { backend.setNotFoundHandler((req, rep) => { rep.code(404).send(); }); }
    }

    if (!App.IP) { App.IP = YARGS.ip; }
    if (!App.Port) { App.Port = YARGS.port; }
    backend.listen(App.Port, App.IP, (err, address) => {
        if (err) { LOG.ERROR(err); throw err; }
        else {
            LOG.TRACE('App.InitBackend:Done');
            //if (App.Args.loglevel == 'trace') { console.log(App.Backend.printRoutes()); }
            //console.log(App.Routes);
            //Object.keys(App.Routes).sort().forEach(z => { console.log(chalk.gray(z)) });
        }
    });
    App.Backend = backend;
}

//

App.Run = function () {
    if (App.InitArgs) {
        //LOG.TRACE('App.InitArgs');
        App.InitArgs();
    }

    if (App.InitInfo) {
        //LOG.TRACE('App.InitInfo');
        App.InitInfo();
    }

    if (App.Argy) { App.Args = App.Argy.argv; } else { App.Argy = YARGY; App.Args = YARGS; }
    if (App.Args.debuglogger) { LOG.TRACE('TRACE'); LOG.DEBUG('DEBUG'); LOG.INFO('INFO'); LOG.WARN('WARN'); LOG.ERROR('ERROR'); App.ExitSilent(); }
    if (App.Args.debugargs) { console.log("\n"); console.log(App.Args); console.log("\n"); App.ExitSilent(); }
    if (App.Args.help) { App.Argy.showHelp('log'); console.log("\n" + App.Info('Node') + "\n"); App.ExitSilent(); }
    if (App.Args.version) { console.log(App.Meta.Version); App.ExitSilent(); }

    process.onSIGTERM = function () { LOG.WARN('App.Process: SIGTERM'); App.Exit(1); };

    //LOG.TRACE({ App: App });
    LOG.TRACE('Node.Info: ' + chalk.white(App.Info('Node')));
    LOG.TRACE('Node.Args: ' + chalk.white(App.Info('Node.Args')));
    LOG.TRACE('XT.Init: ' + chalk.gray(XT.Meta.Full));
    LOG.INFO('App.Init: ' + chalk.white(App.Meta.Full));
    let appinfo = App.Info('App'); if (appinfo != App.Meta.Full) { LOG.INFO('App.Info: ' + chalk.white(App.Info('App'))); }

    LOG.TRACE('App.Run');

    if (App.InitData) {
        LOG.TRACE('App.InitData');
        App.InitData();
    }

    if (!App.Backend) {
        if (App.InitBackend) {
            LOG.TRACE('App.InitBackend');
            App.InitBackend();
        }
        else if (App.Routes && App.InitBackendRoutes) {
            LOG.TRACE('App.InitBackendRoutes');
            App.InitBackendRoutes();
        }
    }

    if (App.Init) {
        LOG.TRACE('App.Init');
        App.Init();
    }

    if (App.InitDone) {
        LOG.TRACE('App.InitDone');
        App.InitDone();
    }

    if (App.Args.initonly) { App.Exit('App.InitOnly: Exiting Now'); return; }

    if (App.Main) {
        LOG.TRACE('App.Main');
        setTimeout(App.Main, 9);
    }
}

//

module.exports = XT;