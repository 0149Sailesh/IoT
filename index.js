var express = require('express');
var bodyParser= require("body-parser"),
    mongoose =require("mongoose"),
    passport= require("passport"),
    LocalStrategy= require("passport-local"),
    User= require("./models/user"),
    Store=require("./models/store");
    var event=1;
console.log();
var status;
var reading=[];
var app = express();
var server = app.listen(4000, () => { //Start the server, listening on port 4000.
    console.log("Listening to requests on port 4000...");
})

var io = require('socket.io')(server); //Bind socket.io to our express server.
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/IoT",{useNewUrlParser: true,useUnifiedTopology: true});
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
	res.render("login");
})

app.get("/register",function(req,res){
	res.render("signup");
})

app.post("/register",function(req,res){
		
		if(req.body.admin==='edc'){
            var newUser= new User({
                username: req.body.username,
                email: req.body.email,
                });
                User.register(newUser,req.body.password,function(err,user){
                    if(err){
                        console.log(err);
                        res.send("error");
                    }
                    
                        res.redirect("/");
                    
                })
		}
        else{
            res.redirect('/register');
        }
    })

    app.post("/login", passport.authenticate("local",{
        successRedirect:"/index",
        failureRedirect: "/"
    }),function(req,res){});

    app.get("/index",function(req,res){
    res.render("index");
})
const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM5'); 
const parser = port.pipe(new Readline({delimiter: '\r\n'})); 
io.on('connection', (socket) => {
    console.log("Someone connected."); 
})
setInterval(function(){
    var d= new Date();
    if(reading[0]>=7){ 
        Store.create({flow:reading[0],level:reading[1],vol:reading[2],date:d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear(),event:event,time: (d.getHours())+":"+(d.getMinutes())+":"+(d.getSeconds())},function(err,obj){ 
            if(err){
                console.log(err);
            }
            else{
                console.log("Level="+reading[0]+" Flow="+reading[1]);
                console.log("stored");
            }
        })
    }
},1000)
parser.on('data', (temp) => {
     //Read data
    //  console.log(temp);
    reading = temp.split(" ");
    //reading[0] is Level and reading[1] is flow
    // console.log("Level="+reading[0]+" Flow="+reading[1]);
    if(reading[0]<=7&&status==1){ //Change here
        status=0;
        event+=1;
    }
    if(reading[0]>=7){ //Change here
        status=1;
    }
    
    
    var today = new Date();
    
    io.sockets.emit('temp', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:reading[0], level:reading[1]}); //emit the datd i.e. {date, time, temp} to all the connected clients.
});


app.get("/events",function(req,res){
    var today = new Date();

    Store.find({date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear()},function(err,obj){
        var filtered=groupBy(obj,"event");
        var i=0;
        var value=[];
        for(var key in filtered) {
            value[i] = filtered[key];
            i+=1;
        }
        console.log(value);
    res.render("events",{value:value});
})
})

app.get("/chart/:id",function(req,res){
    var today = new Date();
    Store.find({event:req.params.id}).sort({created:1}).exec(function(err,obj){
        if(err){
            console.log(err);
        }
        res.render("chart",{value:obj})
    })
})

function groupBy(OurArray, property) {  
    return OurArray.reduce(function (accumulator, object) { 
       
       
      const key = object[property]; 
      
      
     
      if (!accumulator[key]) {      
        accumulator[key] = [];    
      }    
  
      accumulator[key].push(object);
      
    return accumulator;  
  
    }, {});
}
