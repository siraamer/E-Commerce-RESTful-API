const mongoose = require('mongoose');

//1- Create Schema
const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand Name Is Required'],
      unique: [true, 'Brand must be unique'],
      minLength: [3, 'Too short Brand name'],
      maxLength: [32, 'Too long Brand name'],
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
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post('init', (doc) => {
  imageFactory(doc);
});
brandSchema.post('save', (doc) => {
  imageFactory(doc);
});

// Create Model
const BrandModel = mongoose.model('brand', brandSchema);

module.exports = BrandModel;
