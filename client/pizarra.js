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

central.addEventListener('click', pizarra.doClick.bind(null,pizarra));