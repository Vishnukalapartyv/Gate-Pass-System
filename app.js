var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    User                    = require("./models/user"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    EntryData               = require("./models/entrydata")

var app = express();



var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
    console.log("connection succeeded"); 
}) 
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/gatepass",{useMongoClient: true,});

app.use( express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret:"What Doesnt Kill You Makes You Stronger",
    resave: false,
    saveUninitialized: false
}));

app.set('view engine','ejs');
//
app.use(passport.initialize());
app.use(passport.session());
// 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/home",function(req,res){
    res.render("home");
});

app.get("/",function(req,res){
    res.redirect("home");
});

app.get("/entry",isLoggedIn, function(req, res){
    res.render("entry", {name:req.user.name});
});



app.get("/error", function(req, res){
    res.render("error");
});
// Auth Routes

app.get("/register", function(req, res){
    res.render("register");
});
//handling user sign up
app.post("/register", function(req, res){
    
    User.register(new User({username:req.body.username, empid:req.body.empid, name:req.body.name}),req.body.password, function(err, user){
        
        if(err){
            console.log(err);
            return res.redirect('register');
            console.log(message);
        } //user stragety
        passport.authenticate("local")(req, res, function(){
            res.redirect("/entry"); //once the user sign up
       }); 
    });
});

// Login Routes

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/forgot", function(req, res){
    res.render("forgot");
})

// middleware
app.post("/login", passport.authenticate("local",{
    successRedirect:"/entry",
    failureRedirect:"/error",
}),function(req, res){
    res.send("User is "+ req.user.name);
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/home");
});

app.post("/entry", (req,res) => {
    var data = new EntryData(req.body);
    
    data.save()
        .then(item => {
            res.render("details", {
                objectid: req.user._id.toString(),
                objectname: req.body.objectname,
                name:req.body.name,
                outdate: req.body.outdate,
            });
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.get("/details", function(req, res){
    res.render("details");
})


function newFunction(req) {
    req.assert('password2', 'Passwords do not match').equals(req.body.password);
    var mappedErrors = req.validationErrors(true);
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.post('/entry', function(req,res){  
    var name = req.body.name; 
    var objectname = req.body.objectname;
    var description = req.body.description;
    var outdate = req.body.outdate;
    var returndate = req.body.returndate;

  
    var data = { 
        "name": name, 
        "objectname":objectname,
        "description":description,
        "outdate":outdate,
        "returndate":returndate    
    }
db.collection('details').insertOne(data,function(err, collection){ 
        if (err) throw err; 
        console.log("Record inserted Successfully"); 
              
    }); 
          
    return res.redirect('/entry'); 
}) 


app.listen(4000, 80, function(){
    console.log("connect!");
});

