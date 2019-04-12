const express = require('express');
const session = require('express-session');
const axios = require('axios');
const uuid = require('uuid');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 80;
let sessionUsers = [];
let numUsers = 0;

passport.use(new LocalStrategy(
    {usernameField: 'username'},
    (username, password, done) => {
        axios.get(`http://localhost:5000/users?username=${username}`)
            .then(res => {
                const user = res.data[0];
                if (!user) {
                    return done(null, false, {message: 'Invalid username.\n'});
                }
                if (!bcrypt.compareSync(password, user.password)) {
                    return done(null, false, {message: 'Invalid password.\n'});
                }

                return done(null, user);
            })
            .catch(error => done(error));
    }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    axios.get(`http://localhost:5000/users/${id}`)
        .then(res => done(null, res.data))
        .catch(error => done(error, false))
});

//donne au client acces au dossier public/
app.use(express.static(path.join(__dirname, 'public')));
//pour parser et récuperer les info
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    genid: () => {
        return uuid() // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

//Routing
app.get('/inscription', (req, res) => {
    if (req.session.passport === undefined) {
        res.render("inscription", {notErrorMessage: "", errorMessage: ""});
    } else {
        res.redirect('/main');
    }
});

app.post('/inscription', (req, res) => {
    let POST = req.body;
    if (POST.password && POST.cpassword && POST.email && POST.username) {
        axios.get(`http://localhost:5000/users?username=${POST.username}`)
            .then((response) => {
                if (response.data.length === 0) {
                    if (POST.password === POST.cpassword) {
                        let hash = bcrypt.hashSync(POST.password);
                        axios.post('http://localhost:5000/users', {
                            username: POST.username,
                            email: POST.email,
                            password: hash,
                            xp: 0
                        });
                        res.render('inscription', {notErrorMessage: 'inscription réussie', errorMessage: "",});
                    } else {
                        res.render('inscription', {notErrorMessage: "", errorMessage: 'mot de passe est différent'});
                    }
                } else {
                    res.render('inscription', {notErrorMessage: "", errorMessage: 'ce pseudo est déjà pris'});
                }
            });
    } else {
        res.render('inscription', {notErrorMessage: "", errorMessage: 'il y à un ou plusieurs champs vides'});
    }
});

app.get('/', (req, res) => {
    if (req.session.passport === undefined) {
        res.render("login");
    } else {
        res.redirect('/main');
    }
});

app.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            return res.send(info.message)
        }
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('/', {msg: "mauvais username"});
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.passport.username = user.username;
            return res.redirect('/main');
        })
    })(req, res, next);
});

app.get('/main', (req, res) => {
    if (req.session.passport !== undefined) {
        if (req.session.passport.username && req.session.passport.user) {
            axios.get(`http://localhost:5000/users/${req.session.passport.user}`)
                .then((response) => {
                        if (response.data.username !== req.session.passport.username) {
                            res.redirect('/');
                        } else {
                            res.render('main', {username: req.session.passport.username});
                        }
                    }
                )
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/disconnect', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('login', (user) => {
        socket.username = user;
        sessionUsers[user] = socket.id;
        if (addedUser) return;
        numUsers++;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        io.emit('new user', {user: user, numUsers: numUsers});
    });

    socket.on('choose page', (pageName) => {
        fs.readFile('views/' + pageName + '.html',(err, data) => {
            if (err) throw err;
            socket.emit('load page', data.toString());
        });

    });

    socket.on('message sent', (data) => {
        io.emit('new message', data);
    });

    socket.on('private sent', (data) => {
        io.to(sessionUsers[data.to]).emit('new private', data);
        socket.emit('new private', data);
    });

    socket.on('disconnect', () => {
        if (addedUser) {
            numUsers--;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});