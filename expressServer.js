 
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const DBMemory = require('./dbMemory');
const db = new DBMemory(); 
const MessageServer = require("./messageServer");
const ms = new MessageServer(3001, db);


// config
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*60
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// function
function randomString(){
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!@#$%-+=';
    let chatid = '';
    for(let i = 0; i<9; i++){
        chatid += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return chatid;
}


// url router
app.get('/login', (req, res) =>{
    res.render('login');
});

app.post('/login', async (req, res) => {
    if (req.body.username){
        let auth = await db.queryAccount(req.body.username);
        if (auth && auth.password == req.body.password){
            console.log(req.body.username+'登录成功！');
            let chatid = randomString();
            req.session.chatid = chatid;
            req.session.username = req.body.username;
            res.redirect('/');
        }
        else{
            console.log(req.body.username+'登录失败: 密码错误');
            res.render('login', {errMsg: '密码验证错误'});
        }
    }
    else{
        console.log(req.body.username+'登录失败: 未注册');
        res.render('login', {errMsg: '账号未注册'});
    }
});

app.post('/signup', async (req, res) => {
    if (req.body.username && req.body.password && req.body.repassword){
        if (req.body.password == req.body.repassword){
            console.log(req.body.username+'注册成功！');
            db.addAccount(req.body.username, req.body.password);
            let chatid = randomString();
            req.session.chatid = chatid;
            req.session.username = req.body.username;
            res.redirect('/');
        }
        else{
            console.log(req.body.username+'注册密码不一致');
            res.render('login', {errMsg: '密码和密码验证不一致'});
        }
    }
    else{
        console.log(req.body.username+'注册异常');
        res.render('login', {errMsg: '未知错误'});
    }
});

app.get('/', async (req, res) => {
    if(req.session.chatid && req.session.username){
        logdata = await db.queryLog();
        logdata.reverse();
        res.render('room', {chatid: req.session.chatid, username: req.session.username, data: logdata});
    }
    else{
        res.redirect('login');
    }
});

app.get('/logout', (req, res) => {
    console.log('用户' + req.session.username + '退出登录');
    req.session.username = null;
    res.redirect('login');
});

app.listen(3000, () => {
    console.log("Express running on http://127.0.0.1:3000");
});
