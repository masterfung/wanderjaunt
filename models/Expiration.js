import mongoose from 'mongoose';

let Schema = mongoose.Schema;

const threeYearsMS = 365 * 24 * 60 * 60 * 1000 * 3;
let threeYearsLater = function() { return new Date(Date.now() + threeYearsMS);};

let expirationSchema = new Schema({

	// inventory: [{type: Schema.Types.ObjectId, ref: 'Inventory'}],

	start: { type: Date, default: Date.now },

	expire: { type: Date, default: threeYearsLater },

	name: { type: String, require: true },

	property : [{type: Schema.Types.ObjectId, ref: 'Property'}],

	updated: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Expiration', expirationSchema);
