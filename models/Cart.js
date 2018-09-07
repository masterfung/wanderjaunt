import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';

let Schema = mongoose.Schema;

let cartSchema = new Schema({

	inventory: [{type: Schema.Types.ObjectId, ref: 'Inventory'}],

	association: { type: String, require: true },

	checkOut: { type: Boolean, default: false },

	updated: { type: Date, default: Date.now }

}, { usePushEach: true });

cartSchema.plugin(findOrCreate);

module.exports = mongoose.model('Cart', cartSchema);
