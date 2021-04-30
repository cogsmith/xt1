# 🧰 XT: NodeJS Application Framework 🧰
## Process Initialization, Runtime, Logging, Fastify, Nunjucks

---

<a href='https://github.com/cogsmith/xt'><img src='https://github-readme-stats.vercel.app/api/pin/?username=cogsmith&repo=xt' align='right'></a>

#### <code><a href='https://github.com/cogsmith/xt'><img src='https://github.githubassets.com/images/icons/emoji/octocat.png' width='22'> [GITHUB REPO]</a></code>

#### <code><a href='https://www.npmjs.com/package/@cogsmith/xt'>📦 [NPM PACKAGE]</a></code>

#### <code><a href='https://github.com/cogsmith/xt/blob/main/index.js'>🧾 [VIEW LIB SOURCE CODE]</a></code>

#### <code><a href='https://github.com/cogsmith/xt/projects/1'>📅 [PROJECT TRACKER BOARD]</a></code>

---

[![](https://shields.io/github/package-json/v/cogsmith/xt?label=codebase)](http://github.com/cogsmith/xt)
[![](https://shields.io/github/last-commit/cogsmith/xt)](https://github.com/cogsmith/xt/commits/main)
[![](https://github.com/cogsmith/xt/actions/workflows/DEVKING_CHECK.yml/badge.svg)](https://github.com/cogsmith/xt/actions/workflows/DEVKING_CHECK.yml)

[![](https://shields.io/github/v/release/cogsmith/xt?label=latest+release)](https://github.com/cogsmith/xt/releases)
[![](https://shields.io/github/release-date/cogsmith/xt?color=blue)](https://github.com/cogsmith/xt/releases)
[![](https://shields.io/github/commits-since/cogsmith/xt/latest)](https://github.com/cogsmith/xt/commits/main)
<!-- [![](https://shields.io/github/commit-activity/m/cogsmith/xt)](https://github.com/cogsmith/xt/commits/main) -->

[![](https://shields.io/github/license/cogsmith/xt?color=lightgray)](https://github.com/cogsmith/xt/blob/main/LICENSE)
[![](https://shields.io/github/languages/code-size/cogsmith/xt)](http://github.com/cogsmith/xt)
[![](https://shields.io/github/repo-size/cogsmith/xt)](http://github.com/cogsmith/xt)
[![](https://shields.io/github/issues-raw/cogsmith/xt)](https://github.com/cogsmith/xt/issues)


---

# Minimal Example

    const XT = require('@cogsmith/xt').Init();
    const LOG = XT.Log;
    const App = XT.App;
    App.Run();

---

# Simple Example

    const XT = require('@cogsmith/xt').Init();
    const LOG = XT.Log;
    const App = XT.App;

    App.InitInfo = function () { App.SetInfo('App','EXAMPLE_SIMPLE'); }

    App.Routes = { '/random': (req,rep) => { rep.send(Math.random(); } };

    App.Run();

---

# Full Example

    const XT = require('@cogsmith/xt').Init();
    const LOG = XT.Log;
    const App = XT.App;

    App.InitArgs = function () { 
        App.Argy = yargs(process.argv); 
    }

    App.InitInfo = function () { 
        App.SetInfo('App',function () { return 'EXAMPLE_FULL' });
    }

    App.InitData = function () { 
        App.MyDB = { FOO:123, BAR:Math.random() };
    }

    App.Init = function () {
    }

    App.InitDone = function () {

    }

    App.Main = function () {

    }

    App.Routes = {
        '/foo': (req,rep) => {
            let data = { action:'FOO', rand:Math.random() };
            rep.view('template',data);
        }
    }

    App.Run();

---