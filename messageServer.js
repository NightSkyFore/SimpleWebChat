const ws = require('nodejs-websocket');


/*
    chatUsers = [{id: 1, username: a}];
    id: sec-websocket-key
   
    code:
        -1: close
        0: newConnection
        1: sendUserCount
        2: sendMessage
        3: enter/exit
 */

function sendMessage(server, msg, db=null){
    console.log('send message: ', msg);
    if(msg.code == 2 && db){
        db.addLog(msg.username, msg.message, msg.jointime);
    }
    server.connections.forEach(function(conn){
        conn.sendText(JSON.stringify(msg));
    });
}


function getUserCount(server, chatUsers){
    let msg = {
        code: 1,
        message: chatUsers.length
    }
    sendMessage(server, msg);
}


function newUserJoin(server, chatUsers, user){
    let chatIds = chatUsers.map(item => item.id);
    if (chatIds.indexOf(user.id) == -1){
        console.log('new user:', user);
        let msg = {
            code: 3,
            message: user.username+'进入聊天室'
        }
        sendMessage(server, msg);
        chatUsers.push(user);
    }
    // refresh
    getUserCount(server, chatUsers);
}


function closeConnection(server, chatUsers, id){
    
    let chatIds = chatUsers.map(item => item.id);
    let index = chatIds.indexOf(id)
    if(index != -1){
        console.log('user disconnect:', chatUsers[index].username);
        let msg = {
            code: 3,
            message: chatUsers[index].username+'离开聊天室'
        }
        sendMessage(server, msg);
        chatUsers.splice(index, 1);
    }
    // refresh
    getUserCount(server, chatUsers);
}


function MessageServer(port, database){
    let chatUsers= [];
    let db = database;

    const server = ws.createServer((conn) => {
        conn.on('text', function(msg){
            let info = JSON.parse(msg);
            let code = info.code;

            if (code == 0){
                user = {
                    id: this.headers['sec-websocket-key'],
                    username: info.username
                }
                newUserJoin(server, chatUsers, user);
            }
            else{
                sendMessage(server, info, db);
            }
        });

        
        conn.on('close', function(code, reason){
            id = this.headers['sec-websocket-key'];
            closeConnection(server, chatUsers, id);
            console.log('关闭连接', code, reason);
        });
        
        conn.on('error', function(err){
            console.log('异常', err);
        });
    }).listen(port, () => {
        console.log('MessageServer running on http://127.0.0.1:'+port);
    });


}

module.exports = MessageServer;