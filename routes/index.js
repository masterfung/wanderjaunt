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
		}

		console.log('GOT TO CHANGED!!!!');
		for (let i = 0; i < expirationArr.length; i++) {
			if (!item.expiration.includes(expirationArr[i])) {
				item.expiration.push(expirationArr[i]);
			}
		}

		if (!item.property.includes(res._id)) {
			item.property.push(res._id);
		}

		item.save( (err, savedItem) => {
			if (err) throw err;
		});

		Cart.findOrCreate({ association: property }, function(err, cart, created) {
			if (err) throw err;
			cart.checkOut = true;
			cart.inventory.push(item._id);
			cart.association = res.name;
			cart.save();

			res.savedCart.push(cart._id);
			res.save();
		});


		// item.save(function (error) {
		// 	console.log(item);
		// 	if (error) {
		// 		throw error;
		// 	}


		// });

	});
}

/* GET home page. */
router.get('/', function (req, res, next) {

	res.render('index', {
		title: 'Welcome to Wanderjaunt!'
	});

});

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

router.post('/api/v1/Cart/newOrder', (req, res, next) => {

	if (req.body.inventory.length > 0) {
		let cart = new Cart();
		req.body.inventory.forEach(id => {
			Inventory.findById(id, (err, furniture) => {
				if (err) throw err;
				if (furniture.quantity > 0) {
					furniture.quantity--;
					furniture.save();

					cart.inventory.push(furniture._id);
					cart.association = req.body.association;
					cart.save();
					res.json({
						success: "Updated successfully",
						status: 200,
						data: cart._id
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

router.get('/api/v1/Cart/:id/checkout', (req, res, next) => {
	console.log('ID_____*****', req.params.id);

	Cart.findById(req.params.id, (err, cart) => {
		if (err) {
			res.status(500).json({err});
		}

		cart.checkOut = true;
		cart.save((err) => {
			if (err) throw err;

			Property.findOne({name: cart.association}, (err, prop) => {
				if (err) throw err;
				prop.savedCart.push(cart._id);
				prop.save();
			});

		});

		res.json({
			success: "Checkout successfully",
			status: 200,
			data: cart
		});
	});

});

restify.serve(router, Inventory);
restify.serve(router, Property);
restify.serve(router, Cart);
restify.serve(router, Expiration);

module.exports = router;
