function Pizarra(){
}

/**
 * @typedef {{x:number, y:number, top:string, left:string, text:string}} ObjectData
 */

var pizarra = new Pizarra();

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

var objects={

}

central.addEventListener('click', function(event){
    var objectId = new Date().toJSON().replace(/\D/g,'') + Math.random().toString().substr(1);
    var objectData = {
        top:event.pageY+'px',
        left:event.pageX+'px',
        text:''
    }
    crearRectangulito(objectId, objectData)
    var rectangulito = objectData.rectangulito;
    rectangulito.contentEditable=true;
    rectangulito.focus();
},false);

/**
 * 
 * @param {ObjectData} objectData 
 * @param {HTMLDivElement} rectangulito 
 */
function refrescarRectangulito(objectData, rectangulito){
    rectangulito.style.top=objectData.top;
    rectangulito.style.left=objectData.left;
    rectangulito.textContent = objectData.text;
    Object.defineProperty(objectData, 'rectangulito',{
        value: rectangulito, 
        enumerable: false,
    });
}

function crearRectangulito(objectId, objectData){
    objects[objectId] = objectData;
    var rectangulito = document.createElement('div');
    refrescarRectangulito(objectData, rectangulito);
    rectangulito.style.border='1px dashed black';
    rectangulito.style.minheight='50px';
    rectangulito.style.minWidth='50px';
    rectangulito.style.backgroundColor='#AFA';
    rectangulito.style.position='absolute';
    rectangulito.style.fontSize='300%';
    rectangulito.style.textAlign='center';
    rectangulito.style.border=colorBordeNormal;
    rectangulito.style.userSelect='none';
    rectangulito.style.padding='4px';
    rectangulito.draggable=true;
    central.appendChild(rectangulito);
    rectangulito.synchronizeInWebSocket=function(){
        var posicion = this.getBoundingClientRect();
        objectData.posicion = posicion;
        webSokect?.send(JSON.stringify({cambios:{[objectId]:objectData}}));
    }
    rectangulito.addEventListener('dblclick', function(event){
        this.contentEditable=true;
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
        this.contentEditable=false;
        this.style.border=colorBordeNormal;
        objectData.text = this.innerText;
        if(this.innerText.trim()==''){
            webSokect?.send(JSON.stringify({cambios:{[objectId]:null}}));
            delete objects[objectId];
            rectangulito.parentNode.removeChild(rectangulito);
        }else{
            setImmediate(function(){
                this.synchronizeInWebSocket();
            })
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
        tacho.style.zIndex = zIndex+1;
        event.dataTransfer.dropEffect = "move";
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
    event.dataTransfer.dropEffect = "move";
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

var url = new URL('/ws', location)
url.protocol = url.protocol.replace('http','ws');
var webSokect = new WebSocket(url.toString())

function flashRectangulito(rectangulito){
    var background=rectangulito.style.backgroundColor;
    rectangulito.style.backgroundColor='#FF8';
    setTimeout(()=>{
        rectangulito.style.backgroundColor=background;
    },1000)
}

webSokect.onmessage = ev=>{
    var data = JSON.parse(ev.data);
    // webSokect.on('message', message=>{
    //    var data = JSON.parse(ev.data);
    //    var data = JSON.parse(message);
    for(var key in data){
        var objectData = data[key];
        if(!objects[key]){
            if(objectData){
                crearRectangulito(key, objectData)
            }
        }else{
            var rectangulito = objects[key].rectangulito
            if(!objectData){
                rectangulito.parentNode.removeChild(rectangulito);
            }
            if(JSON.stringify(objectData) != JSON.stringify(objects[key])){
                refrescarRectangulito(objectData, rectangulito);
                flashRectangulito(rectangulito)
                objects[key] = objectData;
            }
        }
    }
}