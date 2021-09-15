

function resizeNow(){
    lateral.style.height = window.innerHeight - superior.clientHeight -2 + 'px';
    central.style.height = window.innerHeight - superior.clientHeight -2 + 'px';
}

window.addEventListener('load', function(){
    resizeNow();
});

window.addEventListener('resize', resizeNow);

///////////////////////////////////////////////////////////////////////////////
// Con Gina 9/4/2016

var colorBordeNormal = '1px solid #9E9';

var zIndex = 0;

/** @type {{[k in ObjectId]?:ObjectData}} */
var objects={

}

central.addEventListener('mousedown', function(event){
    if(event.target == this) grabbeds = [];
});

/**
 * 
 * @param {ObjectData} objectData 
 * @param {HTMLDivElement} rectangulito 
 */
function refrescarRectangulito(objectData, rectangulito){
    rectangulito.style.top=objectData.posicion.top+'px';
    rectangulito.style.left=objectData.posicion.left+'px';
    rectangulito.style.backgroundColor=objectData.backgroundColor;
    rectangulito.textContent = objectData.text;
    Object.defineProperty(objectData, 'rectangulito',{
        value: rectangulito, 
        enumerable: false,
    });
}

/** @type {Set<HTMLDivElement>} */
var grabbeds = new Set()

/**
 * 
 * @param {ObjectId} objectId 
 * @param {ObjectData} objectData 
 */

function crearRectangulito(objectId, objectData){
    objects[objectId] = objectData;
    /** @type {Rectangulito} */ // @ts-ignore
    var rectangulito = document.createElement('div');
    refrescarRectangulito(objectData, rectangulito);
    rectangulito.className='rectangulito';
    central.appendChild(rectangulito);
    rectangulito.synchronizeInWebSocket=function(opts){
        if(!opts?.skippeable){
            var posicion = this.getBoundingClientRect();
            objectData.posicion = posicion;
            webSokect?.send(JSON.stringify({cambios:{[objectId]:objectData}}));
        }
    }
    rectangulito.addEventListener('dblclick', function(event){
        this.contentEditable='true';
        rectangulito.style.border='1px dashed black';
        event.stopPropagation();
    });
    rectangulito.addEventListener('keypress', function(event){
        if(event.key === "Escape" || event.key === "Esc" || event.key === "Enter"){
            this.blur();
            event.stopPropagation();
        }
    });
    /*
    rectangulito.addEventListener('click', function(event){
        event.stopPropagation();
    });
    */
    rectangulito.addEventListener('blur', function(event){
        this.contentEditable='false';
        this.style.border=colorBordeNormal;
        objectData.text = this.innerText;
        if(this.innerText.trim()==''){
            webSokect?.send(JSON.stringify({cambios:{[objectId]:null}}));
            delete objects[objectId];
            rectangulito.parentNode?.removeChild(rectangulito);
        }else{
            this.synchronizeInWebSocket();
        }
    });
    rectangulito.addEventListener('mousedown', function(event){
        if(this.contentEditable=="true") return;
        zIndex++;
        this.style.cursor = "move";
        grabbeds.add(this)
        grabbeds.forEach(element=>{
            var posicion = element.getBoundingClientRect();
            element.lugarAgarreX = event.pageX - posicion.left;
            element.lugarAgarreY = event.pageY - posicion.top;
            element.style.border='1px dotted red';
            element.style.zIndex = zIndex.toString();
            element.movingWithTheMouse=true;
        })
        tacho.style.visibility='visible';
        tacho.style.zIndex = zIndex.toString();
    });
    document.addEventListener('mouseup', function(event){
        var release = !event.ctrlKey;
        var hasGrabbeds = false;
        grabbeds.forEach(element=>{
            hasGrabbeds = true;
            element.synchronizeInWebSocket();
            if(release){
                element.style.cursor="";
                element.movingWithTheMouse=false;
                element.style.border=colorBordeNormal;
            }
        });
        if(release){
            grabbeds = new Set();
        }
        tacho.style.visibility='hidden';
        if(!hasGrabbeds && event.target == central){
            /** @type {ObjectId} */ // @ts-ignore // ok, acá se crean con algún formato compatible
            var objectId = new Date().toJSON().replace(/\D/g,'') + Math.random().toString().substr(1);
            /** @type {ObjectData} */
            var objectData = {
                // @ts-ignore // faltan campos, ok
                posicion:{
                    top:event.pageY,
                    left:event.pageX,
                },
                backgroundColor:'#AFA',
                text:''
            }
            crearRectangulito(objectId, objectData)
            var rectangulito = objectData.rectangulito;
            rectangulito.contentEditable='true';
            rectangulito.focus();
        }
    });
    document.addEventListener('mousemove', function(event){
        if( (event.buttons & 1) === 1 ){
            grabbeds.forEach(element=>{
                element.style.top  = event.pageY - element.lugarAgarreY +'px';
                element.style.left = event.pageX - element.lugarAgarreX +'px';
                element.synchronizeInWebSocket({skippeable:true});
            });
        }
    });
}

window.addEventListener('load', function(){
    var tacho = document.createElement('img');
    tacho.src='128px-Trash_Can.svg.png';
    tacho.style.height='64px';
    tacho.style.width='64px';
    tacho.style.position='absolute'; 
    tacho.id='tacho';
    central.appendChild(tacho);
    tacho.style.top=window.innerHeight - tacho.clientHeight + 'px';
    tacho.style.left=window.innerWidth - tacho.clientWidth + 'px';
    tacho.style.visibility='hidden';
});

window.addEventListener('resize', function(){
    tacho.style.top=window.innerHeight - tacho.clientHeight + 'px';
    tacho.style.left=window.innerWidth - tacho.clientWidth + 'px';
});

// @ts-ignore REVISAR!!!
var url = new URL('/ws', location)
url.protocol = url.protocol.replace('http','ws');
var webSokect = new WebSocket(url.toString())

/**
 * @param {Rectangulito} rectangulito
 * @param {ObjectData} objectData
 */

function flashRectangulito(rectangulito, objectData){
    rectangulito.style.backgroundColor='#FF8';
    rectangulito.setAttribute('suave','si')
    rectangulito.style.backgroundColor=objectData.backgroundColor;
    setTimeout(()=>{
        rectangulito.removeAttribute('suave');
    },1000)
}

webSokect.onmessage = 
/**
 * @param {MessageEvent<any>} ev 
 */
ev=>{
    var data = JSON.parse(ev.data);
    // webSokect.on('message', message=>{
    //    var data = JSON.parse(ev.data);
    //    var data = JSON.parse(message);
    for(var key in data){
        /** @type {ObjectId} */ // @ts-ignore por ahora no sabe el tipo de for
        var objectId = key;
        var objectData = data[objectId];
        /** @type {ObjectData|undefined} */
        var actualData = objects[objectId]
        if(actualData == null){
            if(objectData){
                crearRectangulito(objectId, objectData)
            }
        }else{
            var rectangulito = actualData.rectangulito
            if(!objectData){
                rectangulito.parentNode?.removeChild(rectangulito);
            }
            if(JSON.stringify(objectData) != JSON.stringify(actualData)){
                flashRectangulito(rectangulito, objectData)
                refrescarRectangulito(objectData, rectangulito);
                objects[objectId] = objectData;
            }
        }
    }
}