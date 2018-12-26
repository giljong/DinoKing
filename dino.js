var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var http = require('http');
var app = express();
var mysql = require('mysql');
var path = require('path');

var con = mysql.createConnection({
	host : '127.127.127.127',
	port : '3306',
	user : 'root',
	password : '1',
	database : 'dino'
});

con.connect();

app.set('view engine','ejs');
app.set('view engine','jade');
app.set('views','./public');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: '122345564fasdfafa54fsadaf', //사용자의 세션아이디 값
  resave: false,  //재접속 시 세션아이디 재발급x
  saveUninitialized: true,  //세션 사용 전까지 세션아이디 발급x
}));

app.get('/register',(req,res) => {
  res.sendFile(path.join(__dirname, '../Game/public', 'register.html'));
});

app.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname, '../Game/public', 'login.html'));
});

app.post('/register',(req, res) => {
  var tmpId = req.body.id;
  var tmpPwd = req.body.pwd;
  var tmpEmail = req.body.email;
  if(tmpId===''||tmpPwd===''||tmpEmail==='')
		res.send('<script type="text/javascript">alert("입력되지 않은 값이 있습니다.");window.location.href="/register";</script>');
  else{
    con.query('select *from user where id = ?', tmpId, (err, result) => {
			if(err) throw err
			if(!(result.length===0))
      	res.send('<script type="text/javascript">alert("중복되는 아이디입니다.");window.location.href="register";</script>');
      else {
      	con.query('insert into user (id,pwd,email) values (?,?,?)',[tmpId,tmpPwd,tmpEmail], (error,results) => {
				console.log(results,tmpId,tmpPwd,tmpEmail);
        res.send('<script type="text/javascript">alert("회원가입 성공!");window.location.href="login";</script>');
        })
			}
		})
	}
})

app.post('/login',(req, res) => {
  var user_id = req.body.id;
  var password = req.body.pwd;
  con.query('select *from user where id = ?', user_id, (err, result) => {
		if (err) throw err;
    else {
      if(result.length === 0)
      	res.send('<script type="text/javascript">alert("존재하지 않는 아이디입니다.");window.location.href"login";</script>');
      else {
      	if (password === result[0].pwd){
					req.session.user = user_id;
					req.session.save(() => {
							res.redirect('/');
						})
					}
    		else
      		res.send('<script type="text/javascript">alert("비밀번호가 일치하지 않습니다.");window.location.href="login"</script>');
      }
		}
  });
});

app.get('/', (req, res) => {
	var user_id = req.session.user;
	if(user_id){
    con.query('select *from user where id = ?', user_id,(err,result) => {
			if (err) throw err;
			else{
				if(!result[0].choice)
        	res.redirect('/choose')
				else{
					res.render('index.ejs',{
						dino: result[0].choice,
						exp: result[0].exp
					});
				}
			}
  	})
	}
	else
		res.redirect('/login');
});

app.get('/card', (req,res) => {
	var user = req.session.user;
	con.query('update user set exp = exp + 100 where id = ?',user);
	res.sendFile(path.join(__dirname, '../Game/public', 'card.html'));
})


app.get('/gun', (req,res) => {
	var user = req.session.user;
	con.query('update user set exp = exp + 100 where id = ?',user);
	res.sendFile(path.join(__dirname, '../Game/public', 'gun.html'));
})

app.get('/run', (req,res) => {
	var user = req.session.user;
	con.query('update user set exp = exp + 100 where id = ?',user);
	res.sendFile(path.join(__dirname, '../Game/public', 'run.html'));
})


/*app.get('/logout', (req, res) => {
	delete req.session.user;
	req.session.save(() => {
		res.redirect('/');
	});
});
*/
app.get('/choose',(req,res) => {
	res.sendFile(path.join(__dirname, '../Game/public', 'choose2.html'));
});

app.post('/choose',(req,res) => {
	var dino = req.body.dino;
	const id = req.session.user;
	console.log(dino);
	if(dino === '키오'){
		dino = 1;
		con.query('update user set choice = ? where id = ?',[dino,id]);
		res.redirect('/');
	}
	if(dino === '티라'){
		dino = 2;
		con.query('update user set choice = ? where id = ?',[dino,id]);
		res.redirect('/');
	}
	if(dino === '모사'){
		dino = 3;
		con.query('update user set choice = ? where id = ?',[dino,id]);
		res.redirect('/');
	}
	else{
		res.send('<script type="text/javascript">alert("공룡의 이름을 다시 입력해주세요.");window.location.href="choose";</script>');
		console.log(dino);
	}
})

app.listen(3000, () => {
  console.log("connect");
});
