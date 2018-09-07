import mongoose from 'mongoose';
import Cart from './Cart';

const Schema = mongoose.Schema;

let propertySchema = new Schema({

  name: { type: String, Required: 'Property name cannot be left blank.', unique: true },

  activation: { type: Date, Required: 'Activation date cannot be left blank.' },

  deactivation: { type: Date, Required: 'Deactivation date cannot be left blank' },

  cart : { type: Schema.Types.Mixed,
      default: {
        inventories: [],
        status: "Active"
      }
  },

  savedCart: [{ type: Schema.Types.ObjectId, ref: 'Cart' }],

  updated: { type: Date, default: Date.now }

}, { usePushEach: true });

module.exports = mongoose.model('Property', propertySchema);
