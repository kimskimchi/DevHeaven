var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var path = require('path');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var session = require('express-session');
var Handlebars = require('handlebars');
var Sequelize = require('sequelize');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

function User(username) {
    this.username = username;
}


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


//***********Load database
var db = new sqlite3.Database('db.sqlite');
db.serialize();


//***********Load express
var app = express();
nunjucks.configure('views', {
    autoescape: true,
    express: app
});


//**********Get database
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({secret: 'I am actually a potato',
                 resave: false,
                 saveUninitialized: false
}));
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


//***********passport for fb auth
passport.use(
    new FacebookStrategy({
        clientID: '904025606392699',
        clientSecret: '032787a6cd6ceffd3ab1512c202bfabd',
        callbackURL: 'http://localhost:3000/login/facebook/return',
        profileFields: ['id', 'email', 'displayName', 'name']
    },
    function(accessToken, refreshToken, profile, cb) {
        process.nextTick(function () {
            return cb(null, profile);
        })
        /**
        User.findOrCreate({ facebookID: profile.id}, function (err, user) {
            return cb(err, user);
        });**/
    }
));

app.use(passport.initialize());
app.use(passport.session());


//***********Load html
app.get('/', function (req, res) {
    res.redirect('/intro');
});

app.get('/intro', is_loggedout, function(req, res) {
    res.render('intro.html');
});

app.get('/login', is_loggedout, function(req, res) {
    res.render('login.html');
});

app.get('/login/facebook',
        passport.authenticate('facebook', { scope: ['email']})
);

app.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {

        //req.session.username = req.user.displayName;
        //Use following code snippet to see info passed from facebook:
        req.session.username = req.user._json.email;
        db.all("SELECT * FROM users WHERE username = ?", [req.session.username], function(err, rows) {
            //Error while searching dtraabase:
            if (err) {
                console.log('Error: check query');
                res.redirect('login.html');
            }

            if (rows.length === 0) {
                create_facebookuser(req.user._json.email,
                            req.user._json.first_name,
                            req.user._json.last_name);
            }
        });
            /**

            //Error while retrieving data from database
            if (!rows || rows.length > 1) {
                console.log('Error: wrong data in database');
                res.render('login.html');
            }


            //No username
            if (rows.length === 0) {
                console.log('Error: username not found');
                //TODO:DISPLAY ERROR MESSAGE SOMEWHERE ON LOGIN.HTML
                res.render('login.html');

                create_user(email, username, password, password_confirm, first_name,
                            last_name, function(err) {
                            **/
        res.redirect('/dashboard');
    }
);


app.get('/signup', is_loggedout, function(req, res) {
    res.render('signup.html');
});

app.get('/logout', is_loggedin, function(req, res) {
    delete req.session.username;
    req.logout();
    res.redirect('/login');
});

app.get('/admin', function(req, res) {
    res.render('admin.html');
});

app.get('/dashboard', is_loggedin, find_update, find_user, render_dashboard);

app.get('/myprofile', is_loggedin, find_user, render_profile);

app.get('/admin_dashboard',is_loggedin, find_user, render_admindashboard);

app.get('/deleteuser_admin',is_loggedin, find_user, render_admindashboard);

app.get('/adduser_admin',is_loggedin, find_user, render_admindashboard);

app.get('/editprofile', is_loggedin, find_user, render_editprofile);

app.get('/addapp', is_loggedin, find_user, render_addapp);

app.get('/applyapp', is_loggedin, find_user, function (req, res) {
    res.render('applyapp.html');
});

app.get('/browse', is_loggedin, function (req, res) {
    res.render('browse.html');
});

app.get('/myapps', is_loggedin, function(req, res) {
    res.render('myapps.html');
});

app.post('/getusers', function(req, res) {
    db.all('SELECT * FROM profiles WHERE username LIKE \"%' + searchuserword + '%\" ', function (error, rows) {
        // console.log(rows);
        res.send(rows);
    });
    searchuserword = ''
});

app.get('/myprojects', is_loggedin, function(req, res) {
    res.render('myprojects.html');
});

app.get('/searchuser', is_loggedin, function (req, res) {
    res.render('searchuser.html');
});

app.get('/about', is_loggedin, function (req, res) {
    res.render('about.html');
});

app.get('/appdetail', is_loggedin, function(req, res) {
    res.render('appDetail.html');
});


//***********AJAX requests


var searchappword = '';
app.post('/searchapp', is_loggedin, function(req, res)
{
    searchappword = req.body.appname;
    console.log(searchappword);
    res.render('browse.html');
});

app.post('/getsearchedapps', function(req, res) {
    db.all('SELECT * FROM apps WHERE name LIKE \"%' + searchappword + '%\" ', function (error, rows) {
        // console.log('here');
        res.send(rows);
    });
    searchappword = '';
});

app.post('/getapps', function(req, res) {
    db.all('SELECT * FROM apps WHERE recruiting = 1', function (error, rows) {
        res.send(rows);
    });
});

app.post('/deleteuser_admin', function(req, res) {
    var post = req.body;
    var name = post.name;
    db.run('DELETE from users WHERE username=?',
                [name], function(err) {
            if (err) {
                callback(err);
                return;
            }
            db.run('DELETE from profiles WHERE username=?',
                [name], function(err) {
            if (err) {
                callback(err);
                return;
            }
            res.redirect('/admin_dashboard');
        }); 
    });         
});


var searchuserword = '';
app.post('/searchuserform', is_loggedin, function(req, res)
{
    searchuserword = req.body.username;
    console.log(searchuserword);
    res.render('searchuser.html');
});

app.post('/getsearchedusers', function(req, res) {
    db.all('SELECT * FROM profiles WHERE username LIKE \"%' + searchuserword + '%\" ', function (error, rows) {
        // console.log(rows);
        res.send(rows);
    });
    searchuserword = ''
});

app.post('/addfriend', function(req, res) {
    var newfriend = req.body.username;
    var username = req.session.username;
    console.log(newfriend);
    create_friend(username, newfriend, function(err) {
        if (err) {
            //Error signing up
            console.log('Error: add friend');
            console.log(err);
            res.render('searchuser.html');
        } else {
            console.log('Success: directing to main dashboard page..');
            req.session.username = username;
            res.render('searchuser.html');
        }
    })
    res.render('searchuser.html');

});

function create_friend(username, newfriend) {

    db.run('INSERT INTO friends (user1, user2) VALUES ((SELECT id From profiles WHERE username = ?), (SELECT id From profiles WHERE username = ?))',
        [username, newfriend], function(err, callback) {
        if (err) {
            callback(err);
        }
        db.run('INSERT INTO friends (user1, user2) VALUES ((SELECT id From profiles WHERE username = ?), (SELECT id From profiles WHERE username = ?))',
            [newfriend, username], function(err, callback) {
            if (err) {
                callback(err);
            }
        });
    });

}


app.post('/getmyfriends', function(req, res) {
    db.all('SELECT * FROM profiles, friends WHERE friends.user1 = (SELECT id From profiles WHERE username = ?) and friends.user2 = profiles.id', 
        [req.session.username], 
        function (error, rows) {
            // console.log(req.session.username);
            // console.log(rows);
            res.send(rows);
    });
});

app.post('/getmyapps', function(req, res) {
    console.log('ran');
    db.all('SELECT * FROM apps, app_developers, profiles WHERE profiles.username = ? AND app_developers.user_id = profiles.id AND app_developers.app_id = apps.id',
           [req.session.username],
           function (error, rows) {
        // console.log(rows);
        res.send(rows);
    });
});

app.post('/getmyprojects', function(req, res) {

    db.all('SELECT * FROM apps, app_testers, profiles WHERE profiles.username = ? AND app_testers.user_id = profiles.id AND app_testers.app_id = apps.id',
           [req.session.username],
           function (error, rows) {
        res.send(rows);
    });
});



/**TODO next:
app.post('/searchApp', function(req, res) {
    search_form = req.body;
    db.all('SELECT * FROM apps WHERE name LIKE '%)
});
**/

//***********Login
app.post('/login', function(req, res) {
    var post = req.body;
    var username = post.username;
    var password = post.password;
    username = username.replace(/[^a-z0-9 ,.?!]/ig, '');
    password = password.replace(/[^a-z0-9 ,.?!]/ig, '');
    db.all("SELECT * FROM users WHERE username ='"
            + username + "'", function(err, rows) {
        //Error while searching database
        if(err) {
            console.log('Error: retrieving user login data');
            //Display login with error message
            res.render('login.html');
        }

        //Error while retrieving data from database
        if (!rows || rows.length > 1) {
            console.log('Error: wrong data in database');
            res.render('login.html');
        }


        //No username
        if (rows.length === 0) {
            console.log('Error: username not found');
            //TODO:DISPLAY ERROR MESSAGE SOMEWHERE ON LOGIN.HTML
            res.render('login.html');

        //Success
        } else if (bcrypt.compareSync(password, rows[0].password)) {
            console.log('Success: logging in..');
            console.log('username: ' + username);
            req.session.username = username;
            res.redirect('/dashboard');

        //Fail
        } else {
            console.log('Error: invalid id/pw');
            //TODO:DISPLAY ERROR MESSAGE SOMEWHERE ON LOGIN.HTML
            res.render('login.html');
        }
    });
});

app.post('/admin', function(req, res) {
    var post = req.body;
    var username = post.username;
    var password = post.password;

    db.all("SELECT username, password, is_admin FROM users WHERE username ='"
            + username + "'", function(err, rows) {
        //Error while searching database
        if(err) {
            console.log('Error: retrieving user login data');
            //Display login with error message
            res.render('admin.html');
        }

        //Error while retrieving data from database
        if (!rows || rows.length > 1) {
            console.log('Error: wrong data in database');
            res.render('admin.html');
        }

        //No username
        if (rows.length === 0) {
            console.log('Error: username not found');
            //TODO:DISPLAY ERROR MESSAGE SOMEWHERE ON LOGIN.HTML
            res.render('admin.html');

        //Success
        } else if (bcrypt.compareSync(password, rows[0].password)) {
            if (rows[0].is_admin === 1) {
                console.log('Success: logging in..');
                console.log('username: ' + username);
                req.session.username = username;
                res.redirect('/admin_dashboard');
            }
            else
            {   
                console.log('is not an admin');
                res.render('admin.html');
            }

        //Fail
        } else {
            console.log('Error: invalid id/pw');
            //TODO:DISPLAY ERROR MESSAGE SOMEWHERE ON LOGIN.HTML
            res.render('admin.html');
        }
    });
});


//***********Signup
app.post('/signup', function(req, res) {
    //User already logged in, redirect to main page
    if (req.session.username !== undefined) {
        res.redirect('/dashboard');
        return;
    }

    var post = req.body;
    var email = post.email;
    var username = post.username;
    var password = post.password;
    var password_confirm = post.password_confirm;
    var first_name = post.first_name;
    var last_name = post.last_name;

    username = username.replace(/[^a-z0-9 ,.?!]/ig, '');
    password = password.replace(/[^a-z0-9 ,.?!]/ig, '');
    password_confirm = password_confirm.replace(/[^a-z0-9 ,.?!]/ig, '');
    first_name = first_name.replace(/[^a-z0-9 ,.?!]/ig, '');
    last_name = last_name.replace(/[^a-z0-9 ,.?!]/ig, '');

    create_user(email, username, password, password_confirm, first_name,
                last_name, function(err) {
        if (err) {
            //Error signing up
            console.log('Error: sign up');
            console.log(err);
            res.render('signup.html');
        } else {
            console.log('Success: directing to main dashboard page..');
            req.session.username = username;
            res.redirect('/dashboard');
        }
    })
});

//***********Signup
app.post('/adduser_admin', function(req, res) {

    var post = req.body;
    var email = post.email;
    var username = post.username;
    var password = post.password;
    var password_confirm = post.password_confirm;
    var first_name = post.first_name;
    var last_name = post.last_name;

    username = username.replace(/[^a-z0-9 ,.?!]/ig, '');
    password = password.replace(/[^a-z0-9 ,.?!]/ig, '');
    password_confirm = password_confirm.replace(/[^a-z0-9 ,.?!]/ig, '');
    first_name = first_name.replace(/[^a-z0-9 ,.?!]/ig, '');
    last_name = last_name.replace(/[^a-z0-9 ,.?!]/ig, '');

    create_user(email, username, password, password_confirm, first_name,
                last_name, function(err) {
        if (err) {
            //Error signing up
            console.log('Error: sign up');
            console.log(err);
            res.render('admin_dashboard.html');
        } else {
            console.log('Success: directing to main dashboard page..');
            req.session.username = username;
            res.redirect('/admin_dashboard');
        }
    })
});


//***********edit profile
app.post('/editprofile', function(req, res) {

    var post = req.body;
    var birthday = post.birthday;
    var gender = post.gender;
    var address = post.address;
    var education = post.education;
    var about_you = post.about_you;
    var username = req.session.username;

    console.log("data: " + birthday + gender + address + education + about_you + username);
    update_profile(birthday, gender, address, education, about_you, username,
                 function(err) {
        console.log(err);
        if (err) {
            //Error signing up
            console.log('Error: edit profile');
            console.log(err);
            res.render('editprofile.html');
        } else {
            console.log('Success: directing to profile page..');
            req.session.username = username;
            res.redirect('/myprofile');
        }
    })
});

//***********add app
app.post('/addapp', function(req, res) {

    var post = req.body;
    var appname = post.name;
    var note = post.note;
    var summary = post.summary;
    var lookingfor = post.lookingfor;
    var reward = post.reward;
    var username = req.session.username;
    var company = post.company;
    add_app(appname, note, summary, lookingfor, reward, username, company,
                 function(err) {
        console.log(err);
        if (err) {
            //Error signing up
            console.log('Error: add app');
            console.log(err);
            res.render('addapp.html');
        } else {
            console.log('Success: directing to app page..');
            req.session.username = username;
            res.redirect('/myapps');
        }
    })
});

//***********add app
app.post('/applyapp', function(req, res) {

    var post = req.body;
    var appname = post.name;
    var note = post.note;
    var summary = post.summary;
    var lookingfor = post.lookingfor;
    var reward = post.reward;
    var username = req.session.username;
    console.log("data: " + appname + note + summary + lookingfor + reward + username);
    add_app(appname, note, summary, lookingfor, reward, username,
                 function(err) {
        console.log(err);
        if (err) {
            //Error signing up
            console.log('Error: add app');
            console.log(err);
            res.render('addapp.html');
        } else {
            console.log('Success: directing to app page..');
            req.session.username = username;
            res.redirect('/myapps');
        }
    })
});



//*************************
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


//***********Helper functions
function is_loggedin(req, res, next) {
    if (!req.session.username) {
        console.log('Error: please log in//already logged out');
        res.redirect('/login');
    } else {
        next();
    }
}

function is_loggedout(req, res, next) {
    if (req.session.username) {
        console.log('Error: please log out');
        res.redirect('/dashboard');
    } else {
        next();
    }
}


function create_user(email, username, password, password_confirm, first_name,
                     last_name, callback) {
    //Check passwords match
    if (password !== password_confirm) {
//console.log('Passwords do not match');
        callback('Passwords do not match');
        return;
    }

    //Check if username is available
    db.all('SELECT username FROM users WHERE username = ?', [username],
           function(err, rows) {

        //Error: username is taken
        if(rows.length > 0) {
//console.log('Username already in use');
            callback('Username already in use');
            return;
        }

        var pw_hash = bcrypt.hashSync(password, 10);


        db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
                [username, pw_hash, 0], function(err) {
            if (err) {
                callback(err);
                return;
            }


            db.run('INSERT INTO profiles (username, email, first_name, last_name) VALUES (?, ?, ?, ?)',
                    [username, email, first_name, last_name], function(err) {
                if (err) {
                    callback(err);
                    return;
                }
            });
        });
        callback(err);
    });


}


function create_facebookuser(email, first_name, last_name, callback) {

    //Check if username is available
    db.all('SELECT username FROM users WHERE username = ?', [email],
           function(err, rows) {

        //Error: username is taken
        if(rows.length > 0) {
//console.log('Username already in use');
            callback('Username already in use');
            return;
        }


        db.run('INSERT INTO users (username, is_admin) VALUES (?, ?)',
                [email, 0], function(err) {
            if (err) {
                callback(err);
                return;
            }

            db.run('INSERT INTO profiles (username, email, first_name, last_name) VALUES (?, ?, ?, ?)',
                    [email, email, first_name, last_name], function(err) {
                if (err) {
                    callback(err);
                }
                return;
            });
        });
    });


}


function update_profile(birthday, gender, address, education,
                     about_you, username, callback) {

    //Check if username is available
    db.all('UPDATE profiles SET birthday = ?, gender = ?,address = ?, education = ?, about_you = ? WHERE username = ?',
                    [birthday, gender, address, education, about_you, username], function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(err);
    });
}

function add_app(appname, note, summary, lookingfor,
                     reward, username, company, callback) {

    //Check if app name is available
    db.all('SELECT name FROM apps WHERE name = ?', [appname],
           function(err, rows) {

        //Error: username is taken
        if(rows.length > 0) {
            callback('app name already in use');
            return;
        }
        db.run('INSERT INTO apps (name, note, summary, lookingfor, reward, company) VALUES (?, ?, ?, ?, ?, ?)',
                    [appname, note, summary, lookingfor, reward, company], function(err) {
            if (err) {
                callback(err);
                return;
            }

            db.all('SELECT id FROM apps WHERE name = ?', [appname],
                function(err, rows1) {
                if (err) {
                    callback(err);
                    return;
                }
                if(rows1.length < 1) {
                    callback('not found');
                    return;
                }

                app_id = rows1[0].id;
                console.log(app_id);

                db.all('SELECT id FROM profiles WHERE username = ?', [username],
                     function(err, rows2) {
                    if (err) {
                        callback(err);
                        return;
                    }
                        if(rows2.length < 1) {
                            callback('not found');
                            return;
                        }
                        user_id = rows2[0].id;

                        console.log(user_id);
                        db.run('INSERT INTO app_developers (app_id, user_id) VALUES (?, ?)',
                        [app_id, user_id], function(err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(err);
                    });
                });
            });
        });
    });
}


/**function post_update(title, message, date) {
    db.run('INSERT INTO updates_admin (title, message, date, current) VALUES (?, ?, ?, ?)',
                [title, message, date, 1], function(err) {
            if (err) {
                callback(err);
                return;
            }
            db.run('UPDATE updates_admin SET current = 0 WHERE date < ?', [date],
                    function(err, rows) {
                if (err) {
                    callback(err);
                    return;
                }
            });
        });
}
**/

function find_update(req, res, next) {
    db.all('SELECT * FROM updates_admin WHERE current = ?', [1],
            function(error, rows) {

        if (error || !rows.length) {
            return next(error);
        }

        if (rows.length > 1 ) {
            return next('Error: more than one current update not allowed in database');
        }

        req.update = rows[0];
        return next();
    });
}

function find_user(req, res, next) {
    db.all('SELECT * FROM profiles WHERE username = ?', [req.session.username],
            function(error, rows) {

        if (error || !rows.length) {
            return next(error);
        }

        if (rows.length > 1 ) {
            return next('Error: more than one current update not allowed in database');
        }

        req.user = rows[0];
        return next();
    });
}

/**
function find_apps(req, res, next) {
    //db.all('SELECT * FROM apps WHERE recruiting = 1', function (error, rows) {
    db.all('SELECT * FROM apps', function (error, rows) {
        if (error) {
            return next(error);
        }

        req.apps = rows;
        return next();
    });
} **/


function render_dashboard(req, res) {
    res.render('dashboard.html', {
        update: req.update,
        user: req.user
    });
}

function render_browse(req, res) {
    res.render('browse.html', {
        apps: req.apps,
        stringfy_apps: JSON.stringify(req.apps)
    });
}

function render_profile(req, res) {
    res.render('profile.html', {
        update: req.update,
        user: req.user,
        profile: req.profiles,
        stringfy_update: JSON.stringify(req.update),
        stringfy_user: JSON.stringify(req.user),
    });
}


function render_editprofile(req, res) {
    res.render('editprofile.html', {
        user: req.user,
        profile: req.profiles
    });
}

function render_addapp(req, res) {
    res.render('addapp.html', {
        user: req.user,
        apps: req.apps
    });
}

function render_admindashboard(req, res) {
    res.render('admin_dashboard.html', {
        user: req.user
    });
}



//helper test functions... just for testing.
//TODO: delete once done project
function render_test(req, res) {
    res.render('myprojects.html', {
        data: JSON.stringify(req.data)
    });
}

function find_test(req, res, next) {
    db.all('SELECT * FROM apps, app_testers, profiles WHERE profiles.username = ? AND app_testers.user_id = profiles.id AND app_testers.app_id = apps.id',
           [req.session.username], function (error, rows) {

        if (error) {
            return next(error);
        }

        req.data = rows;
        return next();
    });
}
//console.log(username + password);
/**
        if (bcrypt.compareSync(password, rows[0].password)) {
            console.log('Success: logging in...');

            res.redirect('/admin');
        } else {
            res.send('Invalid username/password');
        }**/
//    res.render('admin.html');
/**
if (post.password === '123') {
    res.redirect('/profile');
}
**/

/**function render_dashboard(req, res) {
    res.render('dashboard', {
        update: req.update
    });
app.get('/dashboard', is_loggedin, function(req, res) {
    res.render('dashboard.html');
});
**///app.get('/myprojects', is_loggedin, find_test, render_test);
/**
SELECT *
FROM
    apps, app_testers, profiles
WHERE
    profiles.username = req.session.username
    AND app_testers.user_id = profiles.id
    AND app_testers.app_id = apps.id

**/
