const asyncHandler = require('express-async-handler');
const Boom = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new Boom(`No Document With This Id: ${id}`, 404));
    }
    document.remove();
    res.status(200).json({
      status: 'Deleted successfully!',
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new Boom(`No Document With This Id: ${req.params.id}`, 404));
    }
    document.save();
    res.status(200).json({ document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json(document);
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    //! Build Query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }
    //! Execute Query
    const document = await query;
    if (!document) {
      return next(new Boom(`No Document With This Id: ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }
    //! 3) Build Query
    const documentsCount = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCount)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();
    //! Execute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ result: documents.length, paginationResult, data: documents });
  });

exports.deleteUser = () =>
  asyncHandler(async (req, res, next) => {
    const deleteUser = await User.findByIdAndUpdate(req.params.id, {
      active: false,
    });
    res.status(200).json({
      status: 'Deleted successfully!',
    });
  });
