const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name Required!'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email Required!'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password Required!'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpired: Date,
    passwordResetVerify: Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },

  { timestamps: true }
);

const imageFactory = (doc) => {
  if (doc.profileImg) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = imageUrl;
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.post('init', (doc) => {
  imageFactory(doc);
});
userSchema.post('save', (doc) => {
  imageFactory(doc);
});

userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: true });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
