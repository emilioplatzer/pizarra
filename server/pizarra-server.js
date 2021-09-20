"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var PORT = 54321

// APP
var express = require('express')

var serveContent = require('serve-content');

var MiniTools = require("mini-tools");
var likeAr = require("like-ar").strict;

const ws = require('ws');
const http = require('http');

var charsToken="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._@!-%^*";

function getRandomToken(){
    var arr = [];
    for(var i = 1; i<=10; i++){
        var a = charsToken[Math.floor(Math.random()*charsToken.length)]
        arr.push(a)
    }
    /** @type {PizarraToken} */ // @ts-ignore sé que es uno genérico
    var token = arr.join("")
    return token;
}

/**
 * 
 * @param {{app:express.Application, server:http.Server}} opts
 */

async function pizarra({server, app}){
    var config = await MiniTools.readConfig([
        {pizarras:{
            __default__:{public:true, token:getRandomToken()},
            publica    :{public:true, token:getRandomToken()}
        }},
        'local-config.yaml'
    ]);
    var opts={
        rootPath: './'
    }
    var path = '/ws'
    /** @type {{[p in PizarraId]?:Pizarra<ws>}} */
    var pizarras=likeAr(config.pizarras).map(v=>({sockets:{}, objects:{}, ...v})).plain();
    console.log('====== pizarras ======')
    console.log(pizarras)
    app.use('/',serveContent(opts.rootPath+'client',{allowedExts:['jpg','png','html','gif','css','js']}));
    app.get('/',MiniTools.serveJade(opts.rootPath+'client/pizarra',false));

    const wsServer = new ws.Server({ server, path });
    var socketId=0;
    /**
     * @param {PizarraId} pizarraId 
     */
    function sendAll(pizarraId){
        var pizarra = pizarras[pizarraId];
        if(pizarra){
            var allSockets = pizarra.sockets;
            var objects = pizarras[pizarraId]?.objects;
            likeAr(allSockets).forEach((s,id)=>{
                console.log('sendAll',id,JSON.stringify(objects).substr(0,50)+'...')
                s.send(JSON.stringify(objects))
            })
        }
    }
    wsServer.on('connection', socket => {
        socketId++;
        (function(socketId){
            /** @type {PizarraId|null} */
            var pizarraIdSocket = null;
            socket.on('message', message => {
                /** @type {UnifiedMessage} */ // @ts-ignores
                var data = JSON.parse(message);
                var pizarra = pizarras[data.pizarraId];
                if(pizarraIdSocket != data.pizarraId && pizarra && (pizarra.token == data.pizarraToken || pizarra.public) && !pizarra.sockets[socketId]){
                    if(pizarraIdSocket != null && pizarras[pizarraIdSocket]!=null){
                        // @ts-ignore
                        delete pizarras[pizarraIdSocket].sockets[socketId]
                    }
                    pizarraIdSocket = data.pizarraId
                    pizarra.sockets[socketId] = socket
                }
                if(pizarra && pizarra.token == data.pizarraToken){
                    var objects = pizarra.objects
                    likeAr(data.cambios).forEach((v,k)=>{
                        console.log('actualizando',socketId,k,JSON.stringify(v))
                        objects[k] = v;
                    })
                    sendAll(data.pizarraId);
                }else if(pizarra && pizarra.public){
                    sendAll(data.pizarraId);
                }
            });
            socket.on('close',_=>{
                console.log('delete socket',socketId)
                if(pizarraIdSocket != null && pizarras[pizarraIdSocket]!=null){
                    // @ts-ignore
                    delete pizarras[pizarraIdSocket].sockets[socketId]
                }
            })
        })(socketId);
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