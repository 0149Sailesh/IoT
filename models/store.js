var mongoose =require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")

var StoreSchema= new mongoose.Schema({
	flow:Number, 
	date: String,
	event:Number,
	time:String,
	vol:Number,
	level:Number,
	created: {type:Date, default: Date.now()}
});

module.exports= mongoose.model("Store",StoreSchema);