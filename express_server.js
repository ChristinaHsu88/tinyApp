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

app.get("/urls", (req, res) => {
    if (req.session.user_id === false) {
        return res.redirect("/login");
    }
    let userURL = urlsForUser(req.session.user_id);
    let templateVars = {
        urls: userURL,
        user: users[req.session.user_id],
    }
    res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => { //json the urlDatabase
    res.json(urlDatabase2);
});

app.get("/urls/new", (req, res) => {  //new submission form 
    if (req.session.user_id === false) {
        return res.redirect("/login");
    }
    var user_id = { user: users[req.session.user_id] };
    res.render("urls_new", user_id);
});

app.get("/urls/:id", (req, res) => {
    var id = req.params.id;
    let tVars = { 
        user: users[req.session.user_id], 
        url: urlDatabase2[req.params.id].longURL,
        shortURL: req.params.id 
    };
        if (!req.session.user_id) {
            res.send("this page doesn't belong to you!")
        }
    res.render("urls_show", tVars);

});

app.get("/register", (req, res) => {
    var user_id = { user: users[req.session.user_id]};
    res.render("register", user_id);

});

app.post("/register", (req, res) => { //set up cookie and randomID
    var randomId = generateRandomString();
   

    var password = bcrypt.hashSync(req.body.password, 10);
    var email = req.body.email;

    users[randomId] = {id: randomId, email: email, password: password};
    req.session.user_id = randomId
    res.redirect("/urls");

});

app.get("/login", (req, res) => {
    var user_id = {
        user: users[req.session.user_id], 
    };
    res.render("login", user_id);

});



app.post("/login", (req, res) => {
    var user = checkPw(email, password)
    if (user) {
        res.cookie('email', users[req.session.user_id].email);

        res.redirect("/");
    } else {

        res.render("/login");
    }
    
    // for (let count in users) {
    //     if (req.body.email === users[count].email) {
    //         if (users[count].password === req.body.password) {
    //             res.cookie("user_id", users[count].id);
    //             res.redirect("/urls");
    //         } else {
    //             res.send("wrong password! for" + req.body.email);
    //         }
    //     }
    // }
    res.redirect("/urls");
});

app.get("/logout", (req, res) => {
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie(req.session.user_id);
    res.redirect("/urls");
});


app.post("/urls", (req, res) => {
    var shortUrl = generateRandomString();
    urlDatabase2[shortUrl] = {
        shortURL: shortUrl,
        longURL: req.body["longURL"],
        user_id: req.session.user_id
    }

    res.redirect("/urls/"+ shortUrl); 
});


app.get("/hello", (req, res) => {
    let templateVars = { greeting: 'Hello World!'};
    res.render("hello_world", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

    //get the longurl 
    let longURL1 = urlDatabase2[req.params.shortURL];
    res.redirect(longURL1);

    let longURL = urlDatabase2[req.session.user_id];
    let templateVars = {
        user: users[req.session.user_id] //set up the user object for search in users with certain user_id
    }
    res.redirect(longURL);
})

app.post("/urls/:id/delete", (req, res) => {
    const id = req.session.user_id; 
    delete urlDatabase2[req.session.user_id]; 
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    urlDatabase2[req.session.user_id]
        if (!req.session.user_id) {
            return res.redirect("/urls");
        };
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    var randomString = Math.random().toString(36).substring(7);
    return randomString;
}

generateRandomString();
