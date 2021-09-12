"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var PORT = 54321

// APP
var express = require('express')

var serveContent = require('serve-content');

var MiniTools = require("mini-tools");

/**
 * 
 * @param {express.Application} app 
 */

async function pizarra(app){
    /*
    var config = await MiniTools.readConfig([
        'def-config.yaml',
        'local-config.yaml'
    ]);
    */
    var opts={
        rootPath: './'
    }
    app.use('/',serveContent(opts.rootPath+'client',{allowedExts:['jpg','png','html','gif','css','js']}));
    app.get('/',MiniTools.serveJade(opts.rootPath+'client/pizarra'));
}

async function run(){
    var app = express();
    await pizarra(app);
    app.listen(PORT, function(){
        console.log(`listening ${PORT} port`)
    })
}

run();