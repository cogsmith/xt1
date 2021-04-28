//

const util = require('util');
const wait = util.promisify(setTimeout);

//

const _ = require('lodash');
const pino = require('pino');
const chalk = require('chalk');
const yargs = require('yargs/yargs');

//

const NOP = function () { };
let LOG = NOP; LOG.TRACE = NOP; LOG.DEBUG = NOP; LOG.INFO = NOP; LOG.WARN = NOP; LOG.ERROR = NOP;

// const LOGCONSOLE = function () { console.log(arguments); };
const LOGCONSOLE = console.log; LOG.TRACE = LOGCONSOLE; LOG.DEBUG = LOGCONSOLE; LOG.INFO = LOGCONSOLE; LOG.WARN = LOGCONSOLE; LOG.ERROR = LOGCONSOLE;

//

const YARG = yargs(process.argv).help(false).version(false).group('loglevel', 'Log').describe('loglevel', 'Log Level').default('loglevel', 'info');
const YARGS = YARG.argv;

//

const XT = {};

XT.NOP = NOP;
XT.Wait = wait;

//

XT.Package = require('./package.json');
XT.Meta = _.merge(XT.Package, {
    Version: XT.Package.version || process.env.npm_package_version || '0.0.0',
    Name: XT.Package.namelong || XT.Package.name || 'App',
    NameTag: XT.Package.nametag || XT.Package.name.toUpperCase(),
    Info: XT.Package.description || ''
});
XT.Meta.Full = XT.Meta.Name + ': ' + XT.Meta.Info + ' [' + XT.Meta.Version + ']';

//

const AppPackage = require(process.cwd() + '/' + 'package.json');
const AppMeta = _.merge(AppPackage, {
    Version: AppPackage.version || process.env.npm_package_version || '0.0.0',
    Name: AppPackage.namelong || AppPackage.name || 'App',
    NameTag: AppPackage.nametag || AppPackage.name ? AppPackage.name.toUpperCase() : 'App',
    Info: AppPackage.description || ''
});
AppMeta.Full = AppMeta.Name + ': ' + AppMeta.Info + ' [' + AppMeta.Version + ']';

//

XT.LogLevel = function (level) {
    XT.Log.level = level || 'trace';
    let log = XT.Log;
    if (log.level == 'fatal') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = NOP; log.ERROR = NOP; }
    if (log.level == 'error') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = NOP; log.ERROR = log.error; }
    if (log.level == 'warn') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = NOP; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'info') { log.TRACE = NOP; log.DEBUG = NOP; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'debug') { log.TRACE = NOP; log.DEBUG = log.debug; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    if (log.level == 'trace') { log.TRACE = log.trace; log.DEBUG = log.debug; log.INFO = log.info; log.WARN = log.warn; log.ERROR = log.error; }
    return log.level;
}

XT.GetLogger = function () {
    XT.LogPretty = {
        colorize: true,
        singleLine: true,
        ignore: 'hostname,pid',
        translateTime: 'SYS:yyyy-mm-dd|HH:MM:ss',
        messageFormat: function (log, key, label) {
            let msg = log.msg ? log.msg : '';
            let logout = chalk.gray(AppMeta.NameTag);
            if (msg != '') { logout += ' ' + msg };
            return logout;
        }
    }
    if (YARGS.logpretty == 0) { XT.LogPretty = false; }

    let logger = pino({
        level: YARGS.loglevel || 'trace',
        prettyPrint: XT.LogPretty,
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

XT.Init = function () {
    // XT.LOG = XT.Log; const LOG = XT.Log; LOG.TRACE = LOG.trace; LOG.DEBUG = LOG.debug; LOG.INFO = LOG.info; LOG.WARN = LOG.warn; LOG.ERROR = LOG.error; LOG.FATAL = LOG.fatal;    
    XT.Log = XT.GetLogger();
    XT.LogLevel(YARGS.loglevel || 'trace');
    LOG = XT.Log;

    LOG.TRACE('XT.Init: ' + XT.Meta.Full);

    XT.InitProcess();

    //LOG.TRACE('XT.InitDone');
}

XT.InitProcess = function () {
    //LOG.TRACE('XT.InitProcess');

    process.setMaxListeners(999); require('events').EventEmitter.prototype._maxListeners = 999;
    process.on('uncaughtException', function (err) { console.log("\n"); console.log(err); console.log("\n"); process.exit(1); }); // throw(Error('ERROR'));
    process.onSIGTERM = function () { console.log('SIGTERM'); process.exit(); }; process.on('SIGTERM', function () { process.onSIGTERM(); });
}

//

XT.Init();

//

XT.App = {};
const App = XT.App;

App.Exit = function (z, data) {
    let exit = { code: 0, error: false, silent: false, message: 'App.Exit' };
    if (z && z.stack) { exit.error = z; exit.code = 1; exit.msg = 'App.Exit ' + chalk.white(z.message); z.message = exit.msg; LOG.ERROR(z); LOG.ERROR(exit.msg, _.merge({ ExitCode: exit.code }, data)); }
    else { if (Number.isInteger(z)) { exit.code = z; } else if (typeof (z) == 'string') { exit.message = 'App.Exit ' + chalk.white(z); } else if (z) { exit = z; } if (!exit.error) { delete exit.error; } if (!exit.silent) { LOG.DEBUG(exit.message, _.merge(exit, data)); } }
    process.exit(exit.code);
}

App.Package = AppPackage;
App.Meta = AppMeta;

App.InfoDB = {};

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

App.SetInfo = function (id, value) { if (typeof (value) == 'function') { return App.InfoDB[id] = { Type: 'FX', Value: value } } else { return App.InfoDB[id] = { Type: 'VALUE', Value: value } } };
App.SetInfo('Node.Args', process.argv.join(' '));
App.SetInfo('Node', require('os').hostname().toUpperCase() + ' : ' + process.pid + '/' + process.ppid + ' : ' + process.cwd() + ' : ' + process.version + ' : ' + require('os').version() + ' : ' + process.title);
App.SetInfo('App', App.Meta.Full);

App.Run = function () {
    if (App.InitArgs) {
        //LOG.TRACE('App.InitArgs');
        App.InitArgs();
    }

    if (App.InitInfo) {
        //LOG.TRACE('App.InitInfo');
        App.InitInfo();
    }

    App.Args = YARGS;
    if (App.Argy) { App.Args = App.Argy.argv; }
    if (App.Args.debuglogger) { LOG.TRACE('TRACE'); LOG.DEBUG('DEBUG'); LOG.INFO('INFO'); LOG.WARN('WARN'); LOG.ERROR('ERROR'); App.Exit({ silent: true }); }
    if (App.Args.debugargs) { console.log("\n"); console.log(App.Args); console.log("\n"); App.Exit({ silent: true }); };
    if (App.Args.help) { App.Argy.showHelp('log'); console.log("\n" + App.Info('Node') + "\n"); App.Exit({ silent: true }); }
    if (App.Args.version) { console.log(App.Meta.Version); App.Exit({ silent: true }); }

    process.onSIGTERM = function () { LOG.WARN('App.Process: SIGTERM'); App.Exit(1); };

    //LOG.TRACE({ App: App });
    LOG.TRACE('Node.Info: ' + chalk.white(App.Info('Node')));
    LOG.TRACE('Node.Args: ' + chalk.white(App.Info('Node.Args')));
    LOG.INFO(App.Meta.Full);
    LOG.INFO('App.Info: ' + chalk.white(App.Info('App')));

    LOG.DEBUG('App.Run');

    if (App.InitData) {
        LOG.TRACE('App.InitData');
        App.InitData();
    }

    if (App.InitBackend) {
        LOG.TRACE('App.InitBackend');
        App.InitBackend();
    }

    if (App.Init) {
        LOG.TRACE('App.Init');
        App.Init();
    }

    if (App.InitDone) {
        LOG.TRACE('App.InitDone');
        App.InitDone();
    }

    if (App.Main) {
        LOG.TRACE('App.Main');
        App.Main();
    }
}

//

module.exports = XT;