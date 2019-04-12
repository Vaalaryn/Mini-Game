'use strict';
let currentName = 'anonymous';
$(function () {
    let socket = io();

    $('#connexion').submit(function (event) {
        event.preventDefault();
        socket.emit('login',
            $('#username').val()
        )
    });

    $('#messageInput').keyup(function (e) {
        if (e.which == 13) { // KeyCode de la touche entrée
            socket.emit('msgSent', {
                text: $('#messageInput').val(),
                name: currentName
            });
            $('#messageInput').val('');
        }
    });

    socket.on('newMsg', function (message) {
        $('#chatArea').append('<li>' + '<strong class="name">' + message.name + '</strong>' + ' : ' + message.message + '</li>');
    });

    socket.on('logged', function (me) {
        currentName = me;
        $('#connexion').hide();
        $('#hud').show();
        x = game.offsetLeft;
        y = game.offsetTop;
    });


    let canvas = document.getElementsByClassName('whiteboard')[0];
    let colors = document.getElementsByClassName('color');
    let game = document.getElementsByClassName('pictionary')[0];

    let x; //Offset x
    let y; //Offset y


    function getPos(el) {
        // yay readability
        for (var lx=0, ly=0;
             el != null;
             lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
        return {x: lx,y: ly};
    }

    let context = canvas.getContext('2d');

    let current = {
        color: 'black'
    };
    let drawing = false;




    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (let i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();


    function drawLine(x0, y0, x1, y1, color, emit) {
        x0 -= x;
        y0 -= y;
        x1 -= x;
        y1 -= y;

        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!emit) {
            return;
        }
        let w = canvas.width;
        let h = canvas.height;

        socket.emit('drawing', {
            x0: (x0 + x) / w,
            y0: (y0 + y) / h,
            x1: (x1 + x) / w,
            y1: (y1 + y) / h,
            color: color
        });
    }

    function onMouseDown(e) {
        drawing = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
        if (!drawing) {
            return;
        }
        drawing = false;
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    }

    function onMouseMove(e) {
        if (!drawing) {
            return;
        }
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onColorUpdate(e) {
        current.color = e.target.className.split(' ')[1];
    }

    // limit the number of events per second
    function throttle(callback, delay) {
        let previousCall = new Date().getTime();
        return function () {
            let time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    function onDrawingEvent(data) {
        console.log(data);
        let w = canvas.width;
        let h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // make the canvas fill its parent
    function onResize() {
        canvas.width = $('.pictionary').width();
        canvas.height = $('.pictionary').height();

        x = game.offsetLeft;
        y = game.offsetTop;
    }



});


