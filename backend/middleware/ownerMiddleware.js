// Middleware to check if user owns the resource (seller owns product, user owns order)
const Product = require("../models/Product");
const Order = require("../models/Order");
const ApiError = require("../utils/apiError");

const ownerMiddleware = (resourceType) => {
  return async (req, res, next) => {
    try {
      // SECURITY: Verify user authentication
      if (!req.user) {
        throw new ApiError(401, "User not authenticated");
      }

      let resource;

      switch (resourceType) {
        case "product":
          resource = await Product.findById(req.params.id);
          if (!resource) {
            throw new ApiError(404, "Product not found");
          }

          // SECURITY: Verify seller field exists (edge case: legacy products without seller)
          if (!resource.seller) {
            throw new ApiError(500, "Product missing seller information");
          }

          if (resource.seller.toString() !== req.user.id) {
            throw new ApiError(403, "Access denied - you can only modify your own products");
          }
          break;

        case "order":
          resource = await Order.findById(req.params.id);
          if (!resource) {
            throw new ApiError(404, "Order not found");
          }

          // SECURITY: Verify user field exists
          if (!resource.user) {
            throw new ApiError(500, "Order missing user information");
          }

          if (resource.user.toString() !== req.user.id) {
            throw new ApiError(403, "Access denied - you can only access your own orders");
          }
          break;

        default:
          throw new ApiError(400, "Invalid resource type");
      }

      req.resource = resource; // Attach resource to request for later use
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = ownerMiddleware;