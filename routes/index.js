import express from 'express';
import csv from 'fast-csv';
import fs from 'fs';
import mongoose from 'mongoose';
import restify from 'express-restify-mongoose';

const router = express.Router();

const Inventory = mongoose.model('Inventory');
const Property = mongoose.model('Property');
const Cart = mongoose.model('Cart');
const Expiration = mongoose.model('Expiration');

let inventoriesCSVFile = __dirname + "/../public/files/inventories.csv";
let inventoriesStream = fs.createReadStream(inventoriesCSVFile);

let propertiesCSVFile = __dirname + "/../public/files/properties.csv";
let propertiesStream = fs.createReadStream(propertiesCSVFile);

// Helper function to parse and populate Inventory and Property based on Inventories.csv
function populatePropertyInformation(data, i, item, property, expirationArr) {
	Property.findOne({ name: property }, function (err, res) {
		if (err) {
			throw err;
		}

		for (let j = 0; j < data[i]; j++) {
			let expirationObj = new Expiration();
			expirationObj.name = data[3],
			expirationObj.property.push(res._id);
			expirationObj.save((error) => {
				if (error) {
					throw error;
				}
			});
			expirationArr.push(expirationObj._id);

			Inventory.update({_id: item._id},
				{"$addToSet" : { "expiration": expirationObj._id,
				"property": res._id }}, (err, res) => {
					if (err) throw err;
				}
			)
		}

			// the method findOrCreate is not fully working in Mongoose 5
		Cart.findOrCreate({ association: property }, function(err, cart, created) {
			if (err) throw err;
			cart.checkOut = true;
			cart.inventory.push(item._id);
			cart.association = res.name;
			cart.save();

			res.savedCart.push(cart._id);
			res.save();
		});

	});
}

/* GET home page. */
router.get('/', function (req, res, next) {

	res.render('index', {
		title: 'Welcome to Wanderjaunt!'
	});

});

/* GET property from the CSV to the DB. */
router.get('/api/v1/importProperties', function (req, res, next) {

	let propertiesCsvStream;

	propertiesCsvStream = csv().on("data", (data) => {

		let item = new Property({
			name: data[0],
			activation: data[1],
			deactivation: data[2],
		});

		item.save(function (error) {
			console.log(item);
			if (error) {
				throw error;
			}
		});

	}).on("end", function () {

	});

	propertiesStream.pipe(propertiesCsvStream);
	res.json({
		success: "Properties imported successfully.",
		status: 200
	});
});

/* GET Inventories from CSV & connects it with attributes. */
router.get('/api/v1/importInventories', function (req, res, next) {

	let inventoriesCsvStream;

	inventoriesCsvStream = csv().on("data", function (data) {

		let listofProperties = ['68 West Willetta', '1102 West Turney', '1301 W. 14th Street #14',
	'1301 W. 14th Street #15', '639 N. 5th Avenue', '4142 25th Street #21', '846 N. 2nd Avenue #2A',
'1128 Grand Avenue unit #B201'];

		let item = new Inventory({
			category: data[0],
			subCategory: data[1],
			budget: data[2],
			name: data[3],
			description: data[4],
			brand: data[5],
			unitCost: data[6] || 0,
			quantity: data[7] || 0,
		});

		item.save( (err, savedItem) => {
			if (err) throw err;
			for (let i = 8; i < 16; i++) {
				if (data[i] > 0) {
					let exp = [];
					populatePropertyInformation(data, i, savedItem, listofProperties[i-8], exp);
				}
			}
		});

	}).on("end", function () {

	});

	inventoriesStream.pipe(inventoriesCsvStream);
	res.json({
		success: "Inventories imported successfully.",
		status: 200
	});
});

/* GET json result for fetch button rendering on localhost:3000 (vanity purposes). */
router.get('/api/v1/fetchInventory', function (req, res, next) {

	Inventory.find({}, [],{ sort: { _id: -1 } }, (err, inventories) => {
		if (!err) {
			res.json({
				success: "Updated successfully",
				status: 200,
				data: inventories
			});
		} else {
			res.status(500).json({ err });
		}
	});

});

/* POST new cart order to Cart and sends back cart id of the new. */
router.post('/api/v1/Cart/newOrder', (req, res, next) => {

	if (req.body.inventory.length > 0) {
		let cart = new Cart();
		req.body.inventory.forEach(id => {
			Inventory.findById(id, (err, furniture) => {
				if (err) throw err;
				if (furniture.quantity > 0) {
					furniture.quantity--;
					furniture.save( (err) => {
						if (err) throw err;
						cart.inventory.push(furniture._id);
						cart.association = req.body.association;
						cart.save( (err) => {
							if (err) throw err;
							res.json({
								success: "Updated successfully",
								status: 200,
								data: cart._id
							});
						});
					});

				} else if (furniture.quantity === 0) {
					res.json({
						error: `${furniture.name} is not available. Please reorder and try again later.`,
						data: furniture,
						status: 500
					});
				}
			});
		});


	}

});

/* GET the cart & moves it to checkout status, assoc. exp and property. */
router.get('/api/v1/Cart/:id/checkout', (req, res, next) => {

	Cart.findById(req.params.id, (err, cart) => {
		if (err) {
			res.status(500).json({err});
		}
		if (cart.checkOut) {
			res.json({
				error: "Cannot checkout on an existing cart. Please create a new one again.",
				status: 400
			})
		}
		cart.checkOut = true;
		cart.save((err) => {
			if (err) throw err;

			Property.findOne({name: cart.association}, (err, prop) => {
				if (err) throw err;
				cart.inventory.forEach((inventoryID) => {
					Inventory.findById(inventoryID, (err, item) => {
						Cart.findById(inventoryID, (err, result) => {
							let expirationObj = new Expiration();
							expirationObj.name = item.name;
							expirationObj.property.push(prop._id);
							expirationObj.save( (err) => {
								if (err) throw err;
							});
						});

					});
				});
				prop.savedCart.push(cart._id);
				prop.save( (err) => {
					if (err) throw err;
					res.json({
						success: "Checkout successfully",
						status: 200,
						data: cart
					});
				});
			});

		});
	});

});

// Exposes simple endpoint (details in the README)
restify.serve(router, Inventory);
restify.serve(router, Property);
restify.serve(router, Cart);
restify.serve(router, Expiration);

module.exports = router;
