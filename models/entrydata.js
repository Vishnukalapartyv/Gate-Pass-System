var mongoose = require("mongoose");

var ObjectSchema = new mongoose.Schema({
    name:String,
    objectname:String,
    description:String,
    return:Boolean,
    outdate:Date,
    returndate:Date,
});

module.exports = mongoose.model("Object",ObjectSchema);

