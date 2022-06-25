const fs = require('fs');
require('colors');
const dotenv = require('dotenv');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');

const dbConnection = require('../../DBconfig/database');

dotenv.config({ path: '../../config.env' });

// connect to DB
dbConnection();

// Read data
const Products = JSON.parse(fs.readFileSync('./dummyData.json'));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(Products);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
}
