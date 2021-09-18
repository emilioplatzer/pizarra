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
const http = require('http')

/**
 * 
 * @param {{app:express.Application, server:http.Server}} opts
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
    /** @type {{[k in ObjectId]?:ObjectData}} */
    var objects={

    }
    app.use('/',serveContent(opts.rootPath+'client',{allowedExts:['jpg','png','html','gif','css','js']}));
    app.get('/',MiniTools.serveJade(opts.rootPath+'client/pizarra',false));

    const wsServer = new ws.Server({ server, path });
    var socketId=0;
    /** @type {{[k in number]:ws}} */
    var allSockets={
    }
    function sendAll(){
        console.log(objects)
        likeAr(allSockets).forEach((s,id)=>{
            console.log('sendAll',id,JSON.stringify(objects).substr(0,50)+'...')
            s.send(JSON.stringify(objects))
        })
        console.log('........')
    }
    wsServer.on('connection', socket => {
        socketId++;
        (function(socketId){
            socket.on('message', message => {
                /** @type {UnifiedMessage} */ // @ts-ignores
                var data = JSON.parse(message);
                console.log(data);
                likeAr(data.cambios).forEach((v,k)=>{
                    console.log('actualizando',k,v)
                    objects[k] = v;
                })
                sendAll();
            });
            socket.on('close',_=>{
                console.log('delete',socketId)
                delete allSockets[socketId];
            })
            allSockets[socketId]=socket;
        })(socketId);
        sendAll();
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