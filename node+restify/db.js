var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.dbPath);
var db = mongoose.connection;


// var fs = require('fs');
 
// var Grid = require('gridfs-stream');
// Grid.mongo = mongoose.mongo;

db.on('error', function () {
	console.log('error occured from db');
});

db.once('open', function dbOpen() {
	console.log('successfully opened the db');
	// var gfs = Grid(db.db);
	// //Read file
	// // streaming to gridfs
 //    //filename to store in mongodb
 //    var writestream = gfs.createWriteStream({
 //        filename: '5-Box2D-Demo3.txt'
 //    }); 
 //    fs.create('sdasdasdasdasddad').pipe(writestream);
 
 //    writestream.on('close', function (file) {
 //        // do something with `file`
 //        console.log(file.filename + 'Written To DB');
 //    });

});

exports.mongoose = mongoose;