var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession ({
    name: 'session',
    keys: ['demo'],
    maxAge: 24 * 60 * 60 * 1000
}))

var urlDatabase2 = {
    abc123:{
         shortURL: 'abc123',
         longURL: 'http://www.google.com',
         user_id: 'user1'
     },
     def456:{
         shortURL: 'def456',
         longURL: 'http://www.bing.com',
         user_id: 'notuser1'
     }
 };


var users = {
    "user1": {
        id: "user1",
        email: "frank@gmail.com",
        password: "123"
      }
};


//A function that extracts a user's information based on the session cookie id
function urlsForUser(id){
    let subsetUrls = {}
    for (var index in urlDatabase2) {
        let url = urlDatabase2[index]; 
        if (url.user_id === id) {
            subsetUrls[index] = url;
        }
    }
    return subsetUrls;
}

//A function that checks the encrypted password
function checkPw(email, password) {
    for(var index2 in users) {
        let user = users[index2];
        if(user.email === email && bcrypt.compareSync(password, user.password)) {
            return index2;
        } 
    }
}

app.get("/", (req, res) => {
    res.send("Hello!");
});


//display information depending if the user is logged in
app.get("/urls", (req, res) => {
    if (!users[req.session.user_id]) {
        return res.redirect("/login");
    }
    let userURL = urlsForUser(req.session.user_id);
        let templateVars = {
            urls: userURL,
            user: users[req.session.user_id], 
            allUrl: urlDatabase2 
        }
        res.render("urls_index", templateVars);
      
});

app.get("/urls.json", (req, res) => { 
    res.json(urlDatabase2);
});

//only log in members can add new urls
app.get("/urls/new", (req, res) => { 
    var user_id = { user: users[req.session.user_id]};
    if(!users[req.session.user_id]) {
        return res.redirect("/login");
    } else {
        res.render("urls_new", user_id);
    }
});

app.get("/urls/:id", (req, res) => {
    //var id = req.params.id;
    let tVars = { 
        user: users[req.session.user_id], 
        url: urlDatabase2[req.params.id].longURL,
        shortURL: req.params.id 
    };

        if (users[req.session.user_id] === undefined) {
            res.send("this page doesn't belong to you!")
        }
    res.render("urls_show", tVars);
});

//user register for information. store session id to the registration
app.get("/register", (req, res) => {
    res.render("register");
});

//once register, redirect the users to the urls page
app.post("/register", (req, res) => {
    var randomId = generateRandomString();
    var password = bcrypt.hashSync(req.body.password, 10);
    var email = req.body.email;

    //creating user info object based on the registration information
    users[randomId] = {id: randomId, email: email, password: password};
    req.session.user_id = randomId;
    if (email === false || password === false) {
        res.send("please enter valid information");
    }   
     else {
        return res.redirect("/urls");
    }
});

//log-in page
app.get("/login", (req, res) => {
    res.render("login");
});

//verify user information
app.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var user = checkPw(email, password);
    if (user) {
        res.cookie('email', users[req.session.user_id].email);
        res.redirect("/");
    } else {
        return res.send("Please enter correct information, including both the email and password, or register a new account!");
    }
    res.redirect("/urls");
});


//users logout
app.post("/logout", (req, res) => {
    res.clearCookie('session');
    res.clearCookie('session.sig');
    res.redirect("/urls");
});

//add only new urls with a shortUrl
app.post("/urls", (req, res) => {
    var shortUrl = generateRandomString();
    urlDatabase2[shortUrl] = {
        shortURL: shortUrl,
        longURL: req.body["longURL"],
        user_id: req.session.user_id,
            //updatedUrl: req.body["updatedUrl"]
        }
        res.redirect("/urls/"+ shortUrl);
});

//front page
app.get("/hello", (req, res) => {
    let templateVars = { greeting: 'Hello World!'};
    res.render("hello_world", templateVars);
});

//short hand urls
app.get("/u/:shortURL", (req, res) => {
    //console.log(req.params.shortURL); //shortURL
    let longURL1 = urlDatabase2[req.params.shortURL].longURL;
    res.redirect(longURL1);
})

//delete urls
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id; 
    delete urlDatabase2[id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { 
    urlDatabase2[req.session.user_id];
        if (!req.session.user_id) {
            res.redirect("/urls");
        };
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

//generate random string for user ID
function generateRandomString() {
    var randomString = Math.random().toString(36).substring(7);
    return randomString;
}
generateRandomString();
