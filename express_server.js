var express = require("express");
var app = express();
var PORT = 8080; 
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase }; //set up the object so that the ejs file can access the database via the key "urls"
    res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => { //json the urlDatabase
    res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {  //new submission form - and the path /urls/new actually matches the /urls/:id pattern 
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { //this will match the new form. 
    var id = req.params.id;
    let templateVars = { 
        shortURL: req.params.id,
        url: urlDatabase[id]
    }; //so that the ejs can access value here. create scope for ejs
    res.render("urls_show", templateVars);
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
    //console.log(req.params.shortURL);
    let longURL = urlDatabase[req.params.shortURL]; //use shortURL because the server know the shortURL name already.
                                                    //see/u/:shortURL 
    res.redirect(longURL);

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