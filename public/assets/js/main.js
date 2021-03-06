$(() => {
    let socket = io();
    socket.emit('login', username);


    $('.chooseGame').click( function (e) {
        socket.emit('choose page', this.getAttribute('data-game'));
    });

    socket.on('load page', (gamePage) => {
        document.getElementById('game').innerHTML = gamePage.main;
        if (gamePage.name === 'memo')
            startMemo();
        if (gamePage.name === 'pui4')
            startPui4();
    });

    $('#inputMessage').keyup( (e) => {
        if (e.which == 13) {
            if($('#inputMessage').val().charAt(0) === '@'){
                let str = $('#inputMessage').val().split(' ')[0];
                socket.emit('private sent', {
                    to: str.substr(1, str.length - 1),
                    message: $('#inputMessage').val().substr(str.length),
                    user: username
                });
            }else if($('#inputMessage').val() !== ''){
                socket.emit('message sent', {
                    message: $('#inputMessage').val(),
                    user: username
                });
            }
            $('#inputMessage').val('');
        }
    });

    socket.on('new user', (data) => {
        $('#messages').append('<li class="newuser">' + data.user + " s'est connecté</li>");
        $('#pplOnline').text(data.numUsers);
    });

    socket.on('new message', (data) => {
        $('#messages').append('<li class="message"><em class="username">' + data.user + ' : </em><span class="messageContent">' + data.message + '</span></li>');
    });

    socket.on('new private', (data) => {
        $('#messages').append('<li class="WhispMessage"><em class="whispUsername">' + data.user + '<i class="fas fa-arrow-right"></i> ' + data.to +' : </em><span class="messageContent">' + data.message + '</span></li>');
    });

    socket.on('user left', (data) => {
        $('#messages').append('<li class="newuser">' + data.username + " s'est déconnecté</li>");
        $('#pplOnline').text(data.numUsers);
    });
});
