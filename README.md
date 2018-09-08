# Wanderjaunt Inventory Management

This has been an interesting challenge. In this project, you will find what I have accomplished in the time frame designated. Please let me know if you have any questions.

## Installation
Make sure you have the [Node](https://nodejs.org/dist/v10.10.0/node-v10.10.0.pkg) installed.

I am using MongoDB as my DB. I `brew install mongodb` and insure you have initialized the daeman to run the DB (the information will be specified after the brew installation completes).

The next installation is [Postman](https://www.getpostman.com/apps). This application will allow us to make API calls to the express server.

Open two Terminal sessions and in both windows, change to this project directory. Next, you will install the required packages through `npm install`. Once the installation has completed, you will need to install nodemon globally via `npm install -g nodemon`. Nodemon will keep the server alive and refreshed when changes are made to any of the JS file.

Run `nodemon ./bin/wwww` and the application should initialize. Head to `localhost:3000` on your browser to see the work. I have added a simple frontend look to the with a simple import and fetch inventory button. Please DO NOT click any of those buttons yet. Additional steps are needed before you can proceed.

In the second Terminal window, please type `mongo` to initialize the Mongo shell. Please insure you are in the project direction before you type the command.

## Information

Go to Postman and type in the GET box `localhost:3000/api/v1/importProperties` to initialize the population of properties to the MongoDB.

From here, go the MongoDB shell and type `use wanderjaunt` to get into the this database. `show collections` will display all the collections the DB has right now, at the moment, just "properties."

Next, we will initialize the inventory to our database. Head back to Postman and initialize another GET query with the following endpoint: `localhost:3000/api/v1/importInventories`. This will start the process of adding inventories, expirations, and cart. If you type `show collections` you should see several new collections in the DB.

I am using a NPM package to help create simple basic endpoints such as:
`localhost:3000/api/v1/Cart` - will show all the carts
`localhost:3000/api/v1/Inventory` - will show all the inventories
`localhost:3000/api/v1/Expiration` - will show all the expirations
`localhost:3000/api/v1/Property` - will show all the properties

If you add :id at the end, you will see the specific entity of the item you are seeking

Here are my created endpoints:

`/` - home page would show a simple Twitter Bootstrap with two buttons (you can click on Fetch Inventory but DO NOT click on Import Inventory)
`/api/v1/importProperties` - we have already seen this in action, imports the properties.csv into the DB
`/api/v1/importInventories` - we have already seen this in action, imports the inventories.csv into the DB and populate existing furnitures to properties
`/api/v1/fetchInventory` - only usable on the frontend of the site (via a browser), where you can view all the imported data from inventories.csv (minus properties information [col-i to col-p])
`/api/v1/Cart/newOrder` - post request via content-type of application-json with at least inventory and property name (which in the schema is called association). If successful, it will give a cart ID
`/api/v1/Cart/:id/checkout` - moves the shopping cart from non-checkout state to checkout state and adds it to the property


## Testing Things

Your solution should support the following use cases:

-View a list of all furniture, filter and sort by fields such as location, availability, life left.
`http://localhost:3000/api/v1/Inventory` to view all furniture
To filter and sort, feel free to reference [this](https://florianholzapfel.github.io/express-restify-mongoose/#sort) guide for more as its quite powerful

-View information about a specific piece of furniture, including its history.
`http://localhost:3000/api/v1/Inventory/:id` should show you both property and expiration tied to the items and where all of the items have been under that name and description

-Add furniture to a cart to reserve it (multiple designers may be working at once)
`/api/v1/Cart/newOrder`

-"Check out" to assign all furniture in the cart to a property
`/api/v1/Cart/:id/checkout`

-Displaying all furniture at a given property
This can easily be done by going to `http://localhost:3000/api/v1/Property/:id` and looking up the savedCart and querying for the items inside

## Quirks & Thoughts
The way I modeled things and the way data ingestion is occurring, a new cart is created for each items for each property. This is why you see several saved carts associated. It would be nice to modify the logic, with more time, so it can group them into a single cart upon the first data ingestion.

This was my first take on warehouse and inventory space that I designed it with basically four models (Carts, Expiration, Inventory, and Property). Each Expiration entity is created when a user adds it into the Cart or have it associated with a Property (first ingestion). I thought each Expiration entity can serve as a quantity as well but have its local understanding of when it expires. I have added the three year expiration to the model once checkout occurs. Once a cart has been checked out, re-checking out would trigger an error.

Multiple inventory cart could sometimes crash the Nodemon so something you might need to restart the server and try again with the new cart-id.
