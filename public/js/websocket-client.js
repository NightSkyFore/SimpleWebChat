const socket = new WebSocket("ws://localhost:3001");


$('#send').bind("click", () => {
    let username = $('#username').html();
    let newMsg = $('#newMsg').val();
    let jointime = new Date(Date.now()).toISOString();
    let data = {
        code: 2,
        username: username,
        message: newMsg,
        jointime: jointime
    }
    socket.send(JSON.stringify(data));
    $('#newMsg').val('');
});


socket.onopen = () => {
    let username = $('#username').html();
    let id = $('#chatid').html();
    let jointime = new Date(Date.now()).toISOString();
    let data = {
        code: 0,
        username: username
    }
    socket.send(JSON.stringify(data));
}


socket.onmessage = (e) => {
    let msg = JSON.parse(e.data);
    console.log('receive message: ', msg);
    if (msg.code == 2){
        let newHTML = '<div class="card my-2 mx-2" style="background-color: #95EC69;"> \
            <div class="toast-header"> \
            <strong class="mr-auto">' + msg.username + '</strong> \
            <small>' + msg.jointime + '</small></div> \
            <div class="toast-body">' + msg.message + '</div></div>';
        dialog = $('#log').html();
        dialog += newHTML;
        $('#log').html(dialog);
    }
    else if(msg.code == 1){
        let newHTML = '当前人数：' + msg.message;
        $('#count').html(newHTML);
    }
    else if(msg.code == 3){
        let newHTML = '<div class="mx-auto my-2 text-center border rounded-pill" \
            style="min-width: 50px; max-width: 150px; \
            background-color: #C3BDBA;">'
            + msg.message + '</div>';
        dialog = $('#log').html();
        dialog += newHTML;
        $('#log').html(dialog);
    }
    $('#log').scrollTop($('#log').height());
}

