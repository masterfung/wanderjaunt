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

Next, we will initialize the inventory to our database. Head back to Postman and initialize another GET query with the following endpoint: `localhost:3000/api/v1/importInventories`. This will start the process of adding inventories, expirations, and cart 

## Testing Things

Your solution should support the following use cases:

-View a list of all furniture, filter and sort by fields such as location, availability, life left.

-View information about a specific piece of furniture, including its history.

-Add furniture to a cart to reserve it (multiple designers may be working at once)

-"Check out" to assign all furniture in the cart to a property

-Displaying all furniture at a given property
