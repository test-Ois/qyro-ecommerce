const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: "" // Keep for backward compatibility
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["main", "gallery"],
      default: "gallery"
    },
    publicId: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: ""
    }
  }],
  sku: {
    type: String,
    default: ""
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  description: {
    type: String
  },

  category: {
    type: String
  },

  image: {
    type: String,
    default: "" // Keep for backward compatibility, will be deprecated
  },

  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["main", "gallery"],
      default: "gallery"
    },
    publicId: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: ""
    }
  }],

  stock: {
    type: Number,
    required: true,
    default: 0
  },

  variants: {
    type: [variantSchema],
    default: []
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  reviews: [reviewSchema],

  averageRating: {
    type: Number,
    default: 0
  },

  numReviews: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  },

  isBanner: {
    type: Boolean,
    default: false
  },

  isSideBanner: {
    type: Boolean,
    default: false
  },

  isDeal: {
    type: Boolean,
    default: false
  },

  bannerType: {
    type: String,
    enum: ["none", "main", "left", "right"],
    default: "none"
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);