import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let inventorySchema = new Schema({

  category: { type: String, Required: 'Category cannot be left blank.' },

  subCategory: { type: String, Required: 'Sub-category cannot be left blank.' },

  budget: { type: String },

	name: { type: String, Required: 'Product name cannot be left blank', index: true },

  description: { type: String },

	brand: { type: String },

	unitCost: { type: Number, default: 0 },

	quantity: { type: Number, default: 0},

	updated: { type: Date, default: Date.now },

	expiration: [{type: Schema.Types.ObjectId, ref: 'Expiration' }],

	property : [{type: Schema.Types.ObjectId, ref: 'Property' }],

}, { usePushEach: true });

let Inventory = module.exports = mongoose.model('Inventory', inventorySchema);
