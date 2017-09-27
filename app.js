#!/usr/bin/env node

'use strict';



const clc             = require('cli-color');
const csrf            = require('csurf');
const commander       = require('commander');
const express         = require('express');
const fs              = require('fs');
const https           = require('https');
const middleware      = require('./lib/middleware');
const utils           = require('./lib/utils');
const updateNotifier  = require('update-notifier');
const pkg             = require('./package.json');

let app               = express();
let notifier          = updateNotifier({ pkg });

let config;
let defaultPort = 80;
let server      = app;
let sslOptions;

// Notify of any updates
notifier.notify();

try {
  // eslint-disable-next-line import/no-unresolved
  config = utils.deepmerge(require('./config.default'), require('./config'));
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('No custom config.js found, loading config.default.js');
  } else {
    console.error(clc.red('Unable to load config.js!'));
    console.error(clc.red('Error is:'));
    console.log(clc.red(e));
    process.exit(1);
  }

  config = require('./config.default');
}



if (config.options.console) {
  console.log('Welcome to mongo-express');
  console.log('------------------------');
  console.log('\n');
}

commander
  .version(require('./package').version)
  .option('-U, --url <url>', 'connection string url')
  .option('-H, --host <host>', 'hostname or adress')
  .option('-P, --dbport <host>', 'port of the db')
  .option('-u, --username <username>', 'username for authentication')
  .option('-p, --password <password>', 'password for authentication')
  .option('-a, --admin', 'enable authentication as admin')
  .option('-d, --database <database>', 'authenticate to database')
  .option('--port <port>', 'listen on specified port')
.parse(process.argv);

if (commander.username && commander.password) {
  config.mongodb.admin = !!commander.admin;
  if (commander.admin) {
    config.mongodb.adminUsername = commander.username;
    config.mongodb.adminPassword = commander.password;
  } else {
    let user = {
      database: commander.database,
      username: commander.username,
      password: commander.password,
    };
    for (let key in user) {
      if (!user[key]) {
        commander.help();
      }
    }

    config.mongodb.auth[0] = user;
  }

  config.useBasicAuth = false;
}

if (commander.url) {
  config.mongodb.connectionString = commander.url;
  if (commander.admin) {
    config.mongodb.admin = true;
  }
}

config.mongodb.server = commander.host || config.mongodb.server;
config.mongodb.port = commander.dbport || config.mongodb.port;

config.site.port = commander.port || config.site.port;

if (!config.site.baseUrl) {
  console.error('Please specify a baseUrl in your config. Using "/" for now.');
  config.site.baseUrl = '/';
}

app.use(config.site.baseUrl, middleware(config));
app.use(config.site.baseUrl, csrf());

if (config.site.sslEnabled) {
  defaultPort     = 443;
  sslOptions  = {
    key:  fs.readFileSync(config.site.sslKey),
    cert: fs.readFileSync(config.site.sslCert),
  };
  server = https.createServer(sslOptions, app);
}


