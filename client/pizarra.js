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

document.addEventListener('click', function(event){
    var rectangulito = document.createElement('div');
    rectangulito.style.height='50px';
    rectangulito.style.width='50px';
    rectangulito.style.backgroundColor='#AFA';
    rectangulito.style.position='absolute';
    rectangulito.style.top=event.pageY+'px';
    rectangulito.style.left=event.pageX+'px';
    central.appendChild(rectangulito);
});



