const mongoose = require('mongoose');

//1- Create Schema
const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category Name Is Required'],
      unique: [true, 'Category must be unique'],
      minLength: [3, 'Too short Category name'],
      maxLength: [32, 'Too long Category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const imageFactory = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

categorySchema.post('init', (doc) => {
  imageFactory(doc);
});
categorySchema.post('save', (doc) => {
  imageFactory(doc);
});

// Create Model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
