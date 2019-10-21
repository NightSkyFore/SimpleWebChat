const sqlite = require('sqlite3');
const Promise = require('bluebird');

function DBMemory(){
    this.db = new sqlite.Database(':memory:');
    
    this.db.serialize(() => {
        this.db.run('CREATE TABLE account(username TEXT, password TEXT)');
        this.db.run('CREATE TABLE log(username TEXT, message TEXT, time TEXT)');
        
        let stmt = this.db.prepare('INSERT INTO account VALUES (?, ?)');
        stmt.run('aaa', '123456');
        stmt.run('bbb', '234567');
        
        stmt = this.db.prepare('INSERT INTO log VALUES (?, ?, ?)');
        stmt.run('管理员', '欢迎你的到来，沙雕！', '2012-12-31 11:30:00');
        
        stmt.finalize();
    });
    
    this.addAccount = function(username, password){
        this.db.run('INSERT INTO account VALUES (?, ?)', username, password);
    }
    
    this.queryAccount = function(username){
        return new Promise((resolve, reject) => {
            this.db.get('SELECT password FROM account WHERE username = ?', username, (err, row) => {
                if(!err)
                    resolve(row);
                else
                    reject(err);
            });
        });
    }
    
    this.addLog = function(username, str, jointime){
        this.db.run('INSERT INTO log VALUES (?, ?, ?)', username, str, jointime);
    }
    
    this.queryLog = function(i=0){
        return new Promise((resolve, reject) => {
            this.db.all('SELECT username, message, time FROM log ORDER BY time desc limit ?, 30', i, (err, rows) => {
                if(!err)
                    resolve(rows);
                else
                    reject(err);
            });
        });
    }
    
}

module.exports = DBMemory;