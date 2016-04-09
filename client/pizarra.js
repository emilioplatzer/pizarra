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
        rectangulito.style.border='';
    });
    rectangulito.addEventListener('mousedown', function(event){
        rectangulito.style.border='1px dotted red';
    });
    rectangulito.addEventListener('mouseup', function(event){
        rectangulito.style.border='';
    });
},false);



