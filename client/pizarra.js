function Pizarra(){
}

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

central.addEventListener('click', function(event){
    var rectangulito = document.createElement('div');
    rectangulito.contentEditable=true;
    rectangulito.style.border='1px dashed black';
    rectangulito.style.height='50px';
    rectangulito.style.minWidth='50px';
    rectangulito.style.backgroundColor='#AFA';
    rectangulito.style.position='absolute';
    rectangulito.style.top=event.pageY+'px';
    rectangulito.style.left=event.pageX+'px';
    rectangulito.style.fontSize='300%';
    rectangulito.style.textAlign='center';
    rectangulito.style.border=colorBordeNormal;
    central.appendChild(rectangulito);
    rectangulito.focus();
    rectangulito.addEventListener('dblclick', function(event){
        this.contentEditable=true;
        rectangulito.style.border='1px dashed black';
        event.stopPropagation();
    });
    rectangulito.addEventListener('click', function(event){
        event.stopPropagation();
    });
    rectangulito.addEventListener('blur', function(event){
        this.contentEditable=false;
        this.style.border=colorBordeNormal;
    });
    rectangulito.addEventListener('mousedown', function(event){
        this.style.border='1px dotted red';
        this.teEstasMoviendo=true;
        var posicion = this.getBoundingClientRect();
        this.lugarAgarreX = event.pageX - posicion.left;
        this.lugarAgarreY = event.pageY - posicion.top;
        tacho.style.visibility='visible';
    });
    rectangulito.addEventListener('mouseup', function(event){
        this.teEstasMoviendo=false;
        this.style.border=colorBordeNormal;
        tacho.style.visibility='hidden';
    });
    rectangulito.addEventListener('mousemove', function(event){
        if(this.teEstasMoviendo){
            this.style.top  = event.pageY - this.lugarAgarreY +'px';
            this.style.left = event.pageX - this.lugarAgarreX +'px';
        }
    });
},false);

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
