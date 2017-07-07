module.exports = function(app) {
	var file = require('./controllers/file');
	app.get('/api/hellos', function(req, res, next) {
		return res.send("WELCOME TO REST API");
	});

	// app.post('/createStudent', student.createStudent); //Create Student API
    app.get('/api/getallfile/:uid', file.getAllFile); // Get All Student Details API
    app.post('/api/getfile', file.getFileContent);
    app.post('/api/uploadfile', file.uploadFile);
 	 
};