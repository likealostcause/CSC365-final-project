'use strict';
const mongoose = require('mongoose'),
	bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

let userSchema = new Schema({
	local: {
		email: { type: String, required: true },
		password: { type: String, required: true },
		username: { type: String, unique: true }
	},
	facebook: {
		id: String,
		token: String,
		name: String,
		email: String,
		data: {
			profilePicURL: String
		}
	},
	twitter: {
		id: String,
		token: String,
		displayName: String,
		username: String,
		data: {}
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String,
		data: {}
	}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
