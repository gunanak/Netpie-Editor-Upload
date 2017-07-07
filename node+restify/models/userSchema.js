// Model for the Student 
module.exports = (function studentSchema () {
 
	var mongoose = require('../db').mongoose;
	var Schema = mongoose.Schema,
 	ObjectId = Schema.ObjectId;
	var schema = ({
		uid: {type: ObjectId, required: true},
		lastupdate: {type: Date, required: true},
		structure: {
			folder:[
				{
					f_name:String,
					file:Object,
					subfolder:[
						{
							s_name:String,
							file:Object
						}
					]
				}
			],
			file:Object
		}
	});
	var collectionName = 'user';
	var userSchema = mongoose.Schema(schema);
	var User = mongoose.model(collectionName, userSchema);
	
	return User;
})();