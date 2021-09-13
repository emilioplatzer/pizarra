"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var PORT = 54321

// APP
var express = require('express')

var serveContent = require('serve-content');

var MiniTools = require("mini-tools");
var likeAr = require("like-ar");

const ws = require('ws');

/**
 * 
 * @param {express.Application} app 
 */

async function pizarra({server, app}){
    /*
    var config = await MiniTools.readConfig([
        'def-config.yaml',
        'local-config.yaml'
    ]);
    */
    var opts={
        rootPath: './'
    }
    var path = '/ws'
    var objects={

    }
    app.use('/',serveContent(opts.rootPath+'client',{allowedExts:['jpg','png','html','gif','css','js']}));
    app.get('/',MiniTools.serveJade(opts.rootPath+'client/pizarra'));

    const wsServer = new ws.Server({ server, path });
    var socketId=0;
    var allSockets={

    }
    wsServer.on('connection', socket => {
        socketId++
        socket.on('message', message => {
            var data = JSON.parse(message);
            console.log(data);
            likeAr(data.cambios).forEach((v,k)=>{
                objects[k] = v;
            })
            likeAr(allSockets).forEach(s=>{
                s.send(JSON.stringify(objects))
            })
        });
        socket.on('close',_=>{
            console.log('delete',socketId)
            delete allSockets[socketId];
        })
        allSockets[socketId]=socket;
    });
    /*
    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        });
    });
    */
}

async function run(){
    var app = express();
    var server = app.listen(PORT, function(){
        console.log(`listening ${PORT} port`)
    })
    await pizarra({server, app});
}

run();