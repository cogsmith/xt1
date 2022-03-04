# 🧰 XT: NodeJS Application Framework 🧰
## Process Init, Runtime, Logging, Fastify, Nunjucks

---

<a href='https://github.com/cogsmith/xt'><img src='https://github-readme-stats.vercel.app/api/pin/?username=cogsmith&repo=xt' align='right'></a>

#### <code><a href='https://github.com/cogsmith/xt'><img src='https://github.githubassets.com/images/icons/emoji/octocat.png' width='22'> [GITHUB REPO]</a></code>

#### <code><a href='https://www.npmjs.com/package/@cogsmith/xt'>📦 [NPM PACKAGE]</a></code>

#### <code><a href='https://hub.docker.com/r/cogsmith/xtnode'>🐳 [DOCKER RUNTIME IMAGE]</a></code>

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
[![](https://shields.io/docker/image-size/cogsmith/xtnode?sort=date&label=docker+size)](https://hub.docker.com/r/cogsmith/xtnode)
[![](https://shields.io/github/issues-raw/cogsmith/xt)](https://github.com/cogsmith/xt/issues)

---

![XTDOOM](XTDOOM.PNG)

# XT Secret Sauce: Ingredients BOM:

* 🙊 [REDACTED] 
* 💦 99% perspiration
* 🚧 constant evolution
* 🐳 a few npx docker tricks
* 🍅 several tall glasses of V8
* ⚔️ battletested best practices
* 🛠️ countless ecmatastic plumbing hacks
* 🍰 near-excessive amounts of syntactic sugar
* 🦄 ... and 1 velociraptor riding unicorn 🦖

---

# Code Sandbox

# https://xtdemo.cogsmith.com

---

# Run Via Docker

    mkdir /tmp/app ; cd /tmp/app
    tee app.js <<EOF
        const XT = require('@cogsmith/xt').Init();
        const App = XT.App; const LOG = XT.LOG;
        App.Main = function () { LOG.INFO('XTNODE'); };
        App.Run();
    EOF
    
    eval `docker run --rm cogsmith/xtnode evalxtnode 2>/dev/null`
    xtnode version

    xtnode
    xtnode --loglevel trace 
    xtnode --loglevel trace --logjson 1

    xtnodemon --loglevel trace

---

# Docker Webserver

    mkdir /tmp/app ; cd /tmp/app
    tee app.js <<EOF
        const XT = require('@cogsmith/xt').Init();
        const App = XT.App; const LOG = XT.LOG;
        App.Routes = { ELSE: (req,rep) => { rep.send(Math.random()); } };
        App.Run();
    EOF
    
    eval `docker run --rm cogsmith/xtnode evalxtnode 2>/dev/null`
    xtnode version

    # Default Bind IP # XTNODE_BINDIP=127.0.0.1
    xtnode

    # Public Bind IP
    XTNODE_BINDIP=0.0.0.0 ; xtnode

---

# Docker App From Git Repo

    eval `docker run --rm cogsmith/xtnode evalxtnode 2>/dev/null`
    xtnodegit https://github.com/cogsmith/helloworld-xt
---

# Minimal Example

    const XT = require('@cogsmith/xt').Init();
    const App = XT.App; const LOG = XT.LOG;    
    App.Main = function () { LOG.INFO('HELLOWORLD'); };
    App.Run();

---

# Full Example

    const XT = require('@cogsmith/xt').Init();
    const App = XT.App; const LOG = XT.LOG;    

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

    App.Routes = { ELSEROOT: true };
    App.Routes['/foo'] = (req,rep) => { rep.send('FOO'); };

    App.Routes = {
        '/foo': (req,rep) => {
            let data = { action:'FOO', rand:Math.random() };
            rep.view('template',data);
        }
    }

    App.Run();

---
