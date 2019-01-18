var express = require("express");
var app = express();
var PORT = 8080; 
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookie());

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

var users = {
    "123": {
        id: "123", 
        email: "123@123", 
        password: "123"
      }
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    //console.log(req.cookies["user_id"]);
    //console.log(users);
    let templateVars = { 
        urls: urlDatabase,
        user: users[req.cookies["user_id"]] //set up the user object for search in users with certain user_id
    }
    res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => { //json the urlDatabase
    res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {  //new submission form - and the path /urls/new actually matches the /urls/:id pattern 
    var user_id = { user: users[req.cookies["user_id"]] };
    if (user_id === undefined) {
        res.redirect("/login");
    }
    // if (req.body.id != req.cookies["user_id"] {
    //     res.redirect("/login");
    // }
    res.render("urls_new", user_id);
});

app.get("/urls/:id", (req, res) => { //this will match the new form. 
    var id = req.params.id;
    let tVars = { user: users[req.cookies["user_id"]], url: urlDatabase[id], shortURL: req.params.id };
    res.render("urls_show", tVars);
    
});

app.get("/register", (req, res) => {
    var user_id = { user: users[req.cookies["user_id"]] };
    res.render("register", user_id);
    
});

app.post("/register", (req, res) => {
    var randomId = generateRandomString();
    var password = req.body.password;
    var email = req.body.email;
    
    for (var id in users) {
       if (users[id].email === email) { 
            return res.send("400");
        } 
    }
    if (!password || !email) {
        return res.send("400");
    }
    users[randomId] = {id: randomId, email: email, password: password};
    res.cookie("user_id", randomId); //set up randomId with key 'user_id'
    res.redirect("/urls");
    
});

app.get("/login", (req, res) => {
    var user_id = { 
        user: users[req.cookies["user_id"]], //pointing to the entire user_id object
    };
    res.render("login", user_id);
    
});



app.post("/login", (req, res) => {
    // get email and password from body.
    // find out if there is a user with that email.
    // if there is not: 403, we're done.
    // if there is, but the passwords don't match: 403, we're done.
    // Otherwise, log that user in & redirect to /urls
   
    for (let count in users) {
        if (req.body.email === users[count].email) {
            if (users[count].password === req.body.password) {
                res.cookie("user_id", users[count].id);
                res.redirect("/");
            } else {
                res.send("wrong password! for" + req.body.email);
            }
        }  
    }
    res.redirect("/urls");
});

app.get("/logout", (req, res) => {
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
    //console.log(req.body);      // debug statement to see POST parameters
    var shortUrl = generateRandomString();
    //console.log("/urls/"+ shortUrl);
    urlDatabase[shortUrl] = req.body["longURL"]; //generating a key with value within the object
    //res.send("Ok");         // Respond with 'Ok' (we will replace this)
    res.redirect("/u/"+ shortUrl); //redirect to the :id page part. use /u/ so not to confuse with /urls/:id
  });


app.get("/hello", (req, res) => {
    let templateVars = { greeting: 'Hello World!'};
    res.render("hello_world", templateVars);  //render the "hello_world" file, with the value stored in templateVars
});

app.get("/u/:shortURL", (req, res) => { //if /path/: exist already. need another action name under get method 
    var user_id = { user: users[req.cookies["user_id"]] };
    //console.log(req.params.shortURL);
    let longURL = urlDatabase[req.params.shortURL]; //use shortURL because the server know the shortURL name already.
                                                    //see/u/:shortURL 
    res.redirect(longURL);
    let templateVars = { 
        urls: urlDatabase,
        user: users[req.cookies["user_id"]] //set up the user object for search in users with certain user_id
    }

})

app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id; //id corresponds to the path above
    delete urlDatabase[id]; //get the data from id variable.
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    var update = req.body.input;
    var id = req.params.id;
    urlDatabase[id] = update;
    res.redirect("/urls");
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    var randomString = Math.random().toString(36).substring(7);
    return randomString;
}

generateRandomString();