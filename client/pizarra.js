

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

central.addEventListener('click', function(event){
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
},false);

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
    rectangulito.draggable=true;
    central.appendChild(rectangulito);
    rectangulito.synchronizeInWebSocket=function(){
        var posicion = this.getBoundingClientRect();
        objectData.posicion = posicion;
        webSokect?.send(JSON.stringify({cambios:{[objectId]:objectData}}));
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
        this.style.cursor="move";
    });
    /*
    rectangulito.addEventListener('mousedown', function(event){
        if(this.contentEditable) return;
        zIndex++;
        this.style.zIndex = zIndex;
        this.style.border='1px dotted red';
        this.teEstasMoviendo=true;
        tacho.style.visibility='visible';
    });
    rectangulito.addEventListener('mouseup', function(event){
        if(this.contentEditable) return;
        this.teEstasMoviendo=false;
        this.style.border=colorBordeNormal;
        tacho.style.visibility='hidden';
        this.synchronizeInWebSocket();
    });
    rectangulito.addEventListener('mousemove', function(event){
        if(this.teEstasMoviendo){
            this.style.top  = event.pageY - this.lugarAgarreY +'px';
            this.style.left = event.pageX - this.lugarAgarreX +'px';
        }
    });
    */
    rectangulito.addEventListener('dragstart',function(event){
        tacho.style.visibility='visible';
        tacho.style.zIndex = (zIndex+1).toString();
        if(event.dataTransfer) event.dataTransfer.dropEffect = "move";
        var posicion = this.getBoundingClientRect();
        this.lugarAgarreX = event.pageX - posicion.left;
        this.lugarAgarreY = event.pageY - posicion.top;
    })
    rectangulito.addEventListener('dragend',function(event){
        this.style.border=colorBordeNormal;
        this.style.top  = event.pageY - this.lugarAgarreY +'px';
        this.style.left = event.pageX - this.lugarAgarreX +'px';
        this.synchronizeInWebSocket();
    });
}

central.addEventListener('dragover', function(event){
    if(event.dataTransfer) event.dataTransfer.dropEffect = "move";
    event.preventDefault();
})

central.addEventListener('drop', function(event){
    tacho.style.visibility='hidden';
})

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