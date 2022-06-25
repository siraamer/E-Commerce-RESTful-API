const SubCategory = require('../models/subCategoryModel');
const factory = require('./handlerFactory');

exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
// @desc Create SubCategory
// @route POST api/v1/subcategories
// @access private/admin & manager

exports.createSubCategory = factory.createOne(SubCategory);

// @desc  Get list of Sub Categories
// @route Get api/v1/subcategories
// @access public

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
};
exports.getSubCategories = factory.getAll(SubCategory);

// @desc  Get Specific Sub Category
// @route Get api/v1/subcategories/:id
// @access public
exports.getSubCategory = factory.getOne(SubCategory);
// @desc  Update Specific Sub Category
// @route PUT api/v1/subcategories/:id
// @access Privte/admin & manager

exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc  delete Specific Sub Category
// @route DELETE api/v1/subcategories/:id
// @access Privte/admin
exports.deleteSubCategory = factory.deleteOne(SubCategory);
