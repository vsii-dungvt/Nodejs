var Promise = require('bluebird');
module.exports = function(Bousai) {
	Bousai.getAll = function() {
		return new Promise(function(resolve, reject) {
			app.models.Bousai.find({}, function(err, bousais) {
				if (err) {
//					console.log('get DB failed', err);
					reject(err);
				}
				
//				console.log('get all Bousai', bousais);
				resolve(bousais);
			});
		});
	};
};
