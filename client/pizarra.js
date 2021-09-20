const DELTA_TIME_SEND = 200;

const SEND_MOVING = true;
const ENTER_ABRE_OTRO = true;
const TRIM_TEXT_ONBLUR = true;

function resizeNow(){
    lateral.style.height = window.innerHeight - superior.clientHeight -2 + 'px';
    central.style.height = window.innerHeight - superior.clientHeight -2 + 'px';
}

function sendAllPending(){
    unifiedMessage.lastSend = unifiedMessage.lastChange;
    websocket.send(JSON.stringify(unifiedMessage))
    unifiedMessage.cambios={}
}

function sendIdAndToken(){
    if(unifiedMessage.pizarraId && unifiedMessage.pizarraToken){
        sendAllPending();
    }
}

window.addEventListener('load', function(){
    if(!pizarraIdInput.value){
        pizarraIdInput.value = localStorage['pizarraId']||''
        pizarraIdInput.onblur = _ =>{
            // @ts-ignore
            unifiedMessage.pizarraId = pizarraIdInput.value
            localStorage['pizarraId'] = pizarraIdInput.value
            sendIdAndToken()
        }
    }
    // @ts-ignore
    unifiedMessage.pizarraId = pizarraIdInput.value
    if(!pizarraTokenInput.value){
        pizarraTokenInput.value = localStorage['pizarraToken']||''
        pizarraTokenInput.onblur = _ =>{
            // @ts-ignore
            unifiedMessage.pizarraToken = pizarraTokenInput.value
            localStorage['pizarraToken'] = pizarraTokenInput.value
            sendIdAndToken()
        }
    }
    // @ts-ignore
    unifiedMessage.pizarraToken = pizarraTokenInput.value
    resizeNow();
});

window.addEventListener('resize', resizeNow);

///////////////////////////////////////////////////////////////////////////////
// Con Gina 9/4/2016

var colorBordeNormal = '1px solid #9E9';

var zIndex = 0;

/** @type {{[k in ObjectId]?:ObjectData|null}} */
var objects={}

central.addEventListener('mousedown', function(event){
    if(event.target == this) releaseGrabbeds()
});

/**
 * 
 * @param {ObjectData} objectData 
 * @param {HTMLDivElement} rectangulito 
 */
function refrescarRectangulito(objectData, rectangulito){
    rectangulito.style.top=objectData.top+'px';
    rectangulito.style.left=objectData.left+'px';
    rectangulito.style.backgroundColor=objectData.backgroundColor;
    rectangulito.textContent = objectData.text;
    if(zIndex<objectData.zIndex) zIndex = objectData.zIndex;
    rectangulito.style.zIndex = objectData.zIndex?.toString();
    Object.defineProperty(objectData, 'rectangulito',{
        value: rectangulito, 
        enumerable: false,
    });
}

/** @type {Set<HTMLDivElement>} */
var grabbeds = new Set()

/** 
 * @param {{deleting?:boolean}} [opts]
 * */
function releaseGrabbeds(opts){
    grabbeds.forEach(element=>{
        if(opts?.deleting){
            element.eliminate();
        }else{
            element.setAttribute('suave','si')
            element.style.cursor="";
            element.movingWithTheMouse=false;
            element.style.border=colorBordeNormal;
        }
    });
    grabbeds = new Set();
    if(opts?.deleting) sendPendingToServer()
}

var now = new Date;

/** @type {UnifiedMessage} */
var unifiedMessage={
    pizarraId:"publica",
    lastChange:now,
    lastSend:now,
    cambios: {}
}

function sendPendingToServer(){
    if(unifiedMessage.lastChange.getTime() > unifiedMessage.lastSend.getTime()){
        sendAllPending();
    }
}

/**
 * 
 * @param {ObjectId|null} newObjectId 
 * @param {ObjectData} objectData 
 */

function crearRectangulito(newObjectId, objectData){
    /** @type {ObjectId} */ // @ts-ignore // ok, acá se crean con algún formato compatible
    var objectId = newObjectId || new Date().toJSON().replace(/\D/g,'') + Math.random().toString().substr(1);
    objects[objectId] = objectData;
    /** @type {Rectangulito} */ // @ts-ignore
    var rectangulito = document.createElement('div');
    refrescarRectangulito(objectData, rectangulito);
    rectangulito.className='rectangulito';
    rectangulito.setAttribute('suave','si');
    central.appendChild(rectangulito);
    rectangulito.synchronizeInWebSocket=function(opts){
        /** @type {ObjectData} objectData  */ // @ts-ignore  sé que el objectId existe
        var objectData = objects[objectId];
        objectData.left = this.offsetLeft
        objectData.top = this.offsetTop
        objectData.zIndex = Number(rectangulito.style.zIndex);
        unifiedMessage.lastChange = new Date();
        unifiedMessage.cambios[objectId]=objectData;
        if(!opts?.skippeable) sendPendingToServer();
    }
    rectangulito.addEventListener('dblclick', function(event){
        this.contentEditable='true';
        rectangulito.style.border='1px dashed black';
        event.stopPropagation();
    });
    rectangulito.addEventListener('keyup', function(event){
        if(event.key === "Escape" || event.key === "Enter"){
            if(TRIM_TEXT_ONBLUR){
                // @ts-ignore hay rectangulito si estamos acá!
                this.textContent = this.textContent?.trim()
            }
            this.blur();
            event.stopPropagation();
            if(this.textContent && event.key === "Enter" && ENTER_ABRE_OTRO){
                var top = this.offsetTop + this.offsetHeight;
                var left = this.offsetLeft;
                if(top > document.body.offsetHeight - this.offsetHeight - 10){
                    top = 32;
                    left += this.offsetWidth;
                    if(left > document.body.offsetWidth - 64 ) left = 32;
                }
                crearEditableRectangulito({top, left})
            }
        }
    });
    /*
    rectangulito.addEventListener('click', function(event){
        event.stopPropagation();
    });
     */
    rectangulito.eliminate=function(){
        unifiedMessage.lastChange = new Date();
        unifiedMessage.cambios[objectId]=null;
        delete objects[objectId];
        // delete objects[objectId];
        rectangulito.parentNode?.removeChild(rectangulito);
    }
    rectangulito.addEventListener('blur', function(event){
        this.contentEditable='false';
        this.style.border=colorBordeNormal;
        objectData.text = this.innerText;
        if(this.innerText.trim()==''){
            this.eliminate();
            sendPendingToServer();
        }else{
            this.synchronizeInWebSocket();
        }
    });
    rectangulito.addEventListener('mousedown', function(event){
        if(this.contentEditable=="true") return;
        if(!event.ctrlKey && !grabbeds.has(this)) releaseGrabbeds()
        zIndex++;
        this.style.cursor = "move";
        grabbeds.add(this)
        this.setAttribute('suave','no')
        grabbeds.forEach(element=>{
            element.lugarAgarreX = event.clientX - element.offsetLeft;
            element.lugarAgarreY = event.clientY - element.offsetTop;
            element.style.border='1px dotted red';
            element.style.zIndex = zIndex.toString();
            element.movingWithTheMouse=true;
        })
        tacho.style.visibility='visible';
        tacho.style.zIndex = (zIndex+1).toString();
    });
}

/**
 * 
 * @param {{top:number, left:number}} param0 
 * @returns 
 */

function crearEditableRectangulito({top,left}){
    /** @type {ObjectData} */
    var objectData = {
        top, 
        left,
        backgroundColor:'#AFA',
        text:'',
        zIndex,
        // @ts-ignore, se llena abajo
        rectangulito:null
    }
    crearRectangulito(null, objectData)
    var rectangulito = objectData.rectangulito;
    rectangulito.contentEditable='true';
    rectangulito.focus();
    return rectangulito;   
}

var mouseHandling = false;

document.addEventListener('mouseup', function(event){
    var release = !event.ctrlKey;
    if(release){
        mouseHandling = false;
        document.body.setAttribute('mouse-handling','false')
    }
    var hasGrabbeds = false;
    grabbeds.forEach(element=>{
        hasGrabbeds = true;
        element.synchronizeInWebSocket();
    });
    tacho.style.visibility='hidden';
    if(!hasGrabbeds && event.target == central){
        crearEditableRectangulito({top:event.pageY, left:event.pageX})
    }
});

document.addEventListener('mousemove', function(event){
    if( (event.buttons & 1) === 1 ){
        mouseHandling = true;
        document.body.setAttribute('mouse-handling','true')
        grabbeds.forEach(element=>{
            element.style.top  = event.clientY - element.lugarAgarreY +'px';
            element.style.left = event.clientX - element.lugarAgarreX +'px';
            if(SEND_MOVING) element.synchronizeInWebSocket({skippeable:true});
        });
    }
});

window.addEventListener('load', function(){
    var tacho = document.createElement('img');
    tacho.src='128px-Trash_Can.svg.png';
    tacho.style.height='64px';
    tacho.style.width='64px';
    tacho.style.position='absolute'; 
    tacho.id='tacho';
    central.appendChild(tacho);
    sizeAdapt();
    tacho.style.visibility='hidden';
    tacho.addEventListener('mouseup', function(){
        releaseGrabbeds({deleting:true});
    })
});

function sizeAdapt(){
    tacho.style.top=window.innerHeight - tacho.clientHeight - 20 + 'px';
    tacho.style.left=window.innerWidth - tacho.clientWidth - 20 + 'px';
}

window.addEventListener('resize', sizeAdapt);

// @ts-ignore REVISAR!!!
var url = new URL('/ws', location)
url.protocol = url.protocol.replace('http','ws');
var websocket = new WebSocket(url.toString())

/**
 * @param {Rectangulito} rectangulito
 * @param {ObjectData} objectData
 */

function flashRectangulito(rectangulito, objectData){
    rectangulito.style.backgroundColor='#FF8';
    rectangulito.style.backgroundColor=objectData.backgroundColor;
}

websocket.addEventListener('open', () => {
    sendIdAndToken()
    setInterval(_=>{
        sendPendingToServer()
    },100)
});

websocket.onmessage = 
/**
 * @param {MessageEvent<any>} ev 
 */
ev=>{
    var data = JSON.parse(ev.data);
    // websocket.on('message', message=>{
    //    var data = JSON.parse(ev.data);
    //    var data = JSON.parse(message);
    for(var key in data){
        /** @type {ObjectId} */ // @ts-ignore por ahora no sabe el tipo de for
        var objectId = key;
        var objectData = data[objectId];
        /** @type {ObjectData|undefined|null} */
        var actualData = objects[objectId]
        if(actualData == null){
            if(objectData){
                crearRectangulito(objectId, objectData)
            }
        }else{
            var rectangulito = actualData.rectangulito
            if(!rectangulito || !grabbeds.has(rectangulito) || !mouseHandling){
                if(!objectData){
                    rectangulito.parentNode?.removeChild(rectangulito);
                }else if(JSON.stringify(objectData) != JSON.stringify(actualData)){
                    flashRectangulito(rectangulito, objectData)
                    refrescarRectangulito(objectData, rectangulito);
                    objects[objectId] = objectData;
                }
            }
        }
    }
}