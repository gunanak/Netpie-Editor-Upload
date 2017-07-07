function file () {
	var example = '../examples/';
	var User = require('../models/userSchema');

	var fs = require('fs');
	var mongoose = require('../db').mongoose;
	var db = mongoose.connection;
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;
	var gfs = Grid(db.db);
	

	var ObjectId = require('mongodb').ObjectID;

	

	this.getAllFile = function(req,res,next){
		var Grid = require('gridfs');
		var gfs = Grid(db.db);
		var allfile = [];
		var file = [];
		var id = req.params.uid;
		var uid = ObjectId(id)
		// console.log('U '+uid)
		gfs.files.find({uid:uid}).toArray(function (err, files) {
	    if (err) {
	        throw (err);
	    }
	    	// console.log(files)
	    	return res.json({files})
	  	})
	}

	this.getFileContent = function(req,res,next){
		/*read contentfile */
		var Grid = require('gridfs');
		var gfs = Grid(db.db);
		var val = req.params.name;
		var id = req.params.usid;
		console.log('val '+val+' id '+id);
		var value = '';
		var readstream = gfs.createReadStream({
    		filename: val
		});
		readstream.on('data',function(chuck){
			value += chuck;
		})
        readstream.on("end", function () {
            return res.json({value})
        });
		
	}

	this.uploadFile = function(req,res,next){
		var Grid = require('gridfs');
		var gfs = Grid(db.db);
		var filename = req.params.fileName;
		var contents = req.params.contents;
		var date = req.params.date;
		var usid = req.params.usid;
		var fname = null; //reseve from client
		var sname = null;
		var state = 0;
		var id = ObjectId(usid);
		User.distinct('uid',(err,result)=>{
    		if(err){
    			console.log(err);
    		}else{
    			var idStr = id.toString();
    			var b = result.toString();
    			var c = b.split(",");
    			if(c.indexOf(idStr) == -1){
    				user = {uid:id,lastupdate:date,structure:{folder:[{f_name:fname,file:[],
    							subfolder:[{s_name:sname,file:[]}]}],file:[]}};
    				User.create(user, function(err, result) {
						if (err) {
							console.log(err);
							// return res.send({'error':err});	
						}
						else {
							console.log({'status':'successfully saved'});
							state = 1;
						}
					})
    			}
    			else{
    				//check folder of user
    				if(fname != null){
    					User.update({uid:id},{$push:{'structure.folder':{f_name:fname,file:[],subfolder:[{s_name:sname,file:[]}]}}});
    				}
    				gfs.files.find({filename:filename,uid:id}).toArray(function(err,result){
    					if(result.length <= 0){
    						state = 1;
    					}else{
    						var fileId = result[0]._id;
    						var folder = result[0].folder;
    						var subfolder = result[0].subfolder;
    						// console.log(folder+"+"+subfolder);
    						// gfs.chunks.find({}).toArray((err,result)=>{
    						// 	if(err){ console.log(err); }
    						// 	else{ console.log(result)}
    						// })
    						if(folder == null && subfolder == null){
	    						User.distinct('structure.file',{uid:id},(err,result)=>{
	    							var idStr = fileId.toString();
	    							var b = result.toString();
	    							var c = b.split(",");
									index = c.indexOf(idStr);
									console.log(index);
								}).then((e)=>{
									User.update({uid:id}, {$unset : {["structure.file."+index]: 1 }},(err,result)=>{
	    								if(err){ console.log(err); }
	    								else{ console.log(result)}
	    							})
	    							User.update({uid:id}, {$pull : {"structure.file" : null}},(err,result)=>{
	    								if(err){ console.log(err); }
	    								else{ console.log(result)}
	    							})
	    							gfs.files.remove({filename:filename,uid:id},(err,result)=>{
	    								if(err){ console.log(err); }
	    								else{ console.log(result)}
	    							});
	    						
								})
    						}
    						else if(folder != null && subfolder == null){
    							User.distinct('structure.folder.f_name',{uid:id},(err,result)=>{
    								var b = result.toString();
    								var c = b.split(',');
    								var indexF = c.indexOf(folder);
    							}).then((e)=>{
    								User.distinct('structure.folder.'+ indexF +'.file',{uid:id},(err,result)=>{
	    							var idStr = fileId.toString();
	    							var b = result.toString();
	    							var c = b.split(",");
									index = c.indexOf(idStr);
									}).then((e)=>{
										User.update({uid:id}, {$unset : {["structure.folder."+ indexF+ ".file."+index]: 1 }},(err,result)=>{
	    									if(err){ console.log(err); }
	    									else{ console.log(result)}
	    								})
	    								User.update({uid:id}, {$pull : {["structure.folder."+ indexF+ ".file." ]: null}},(err,result)=>{
	    									if(err){ console.log(err); }
	    									else{ console.log(result)}
	    								})
	    								gfs.files.remove({filename:filename,uid:id},(err,result)=>{
	    									if(err){ console.log(err); }
	    									else{ console.log(result)}
	    								});
									})
    							}) 
    						} // else for f & s = null
    						
    					}
   					
    				})
    			}
    		}
    })



    	gfs.writeFile({filename: filename}, contents, function (err, file) {
    		console.log('wrote files to GridFS file %s', file._id);
    		User.find({uid:id},(err,result)=>{
				if (err) {
					console.log(err);
				}
				else { 
					console.log('result '+result);
					var folder = [];
					var subfolder = [];
					var ufid = result[0]._id;
					var uid = result[0].uid;
					gfs.files.update({_id:file._id,filename:filename},{$set:{ufid:ufid,uid:uid,folder:fname,subfolder:sname}});
				}
			}).then(function(e){
				gfs.files.find({_id:file._id,filename:filename}).toArray(function(err,result){
					var ufid = result[0]._id;
    				var folder = result[0].folder;
    				var subfolder = result[0].subfolder;
				
    				console.log('id:'+ufid+'folder: '+folder+' sub '+subfolder)
    				if(folder == null && subfolder == null){
    					User.update({uid:id},{$addToSet:{'structure.file':ufid}},(err,result)=>{
    						console.log(result);
    					})
    				}
    				else if(folder != null && subfolder == null){
    					console.log('2');
    					var indexF;
    					User.find({uid:id},(err,result)=>{
							indexF = result[0].structure.folder.findIndex(i => i.f_name === fname);
						}).then((e)=>{
							console.log(indexF)
							User.update({uid:id,"structure.folder.f_name": fname},{$addToSet:{'structure.folder.$.file':ufid}},(err,result)=>{
    							console.log(result);
    						})
						})
    				}
    				else if(folder != null && subfolder != null){
    					console.log('3');
    					var indexF;
    					var indexSF;
    					User.find({uid:id},(err,result)=>{
							indexF = result[0].structure.folder.findIndex(i => i.f_name === fname);
						}).then((e)=>{
							User.update({uid:id,["structure.folder."+ indexF +".subfolder.s_name"]: sname},{$addToSet:{["structure.folder."+ indexF +".subfolder.$.file"]:ufid}},(err,result)=>{
    							console.log(result);
    						})
						})
    				}
    				
    			})
			})
			
    	})
   		

			// var file = ObjectId("595cb791d535501f0cb49bf2");
   //  	gfs.readFile({_id: file}, function (err, data) {
   //    			console.log('read file %s: %s', file, data);
   //  		});
  		
	}
}
module.exports = new file();