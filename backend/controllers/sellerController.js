const sellerService = require("../services/sellerService");
const asyncHandler = require("../utils/asyncHandler");

exports.getSellerStats = asyncHandler(async (req, res) => {
  const stats = await sellerService.getSellerStats(req.user.id);
  res.json(stats);
});

exports.getSellerProducts = asyncHandler(async (req, res) => {
  const products = await sellerService.getSellerProducts(req.user.id);
  res.json(products);
});

exports.addSellerProduct = asyncHandler(async (req, res) => {
  const saved = await sellerService.addSellerProduct(req, req.user.id);
  res.status(201).json(saved);
});

exports.updateSellerProduct = asyncHandler(async (req, res) => {
  const updated = await sellerService.updateSellerProduct(req.params.id, req, req.user.id);
  res.json(updated);
});

exports.deleteSellerProduct = asyncHandler(async (req, res) => {
  const result = await sellerService.deleteSellerProduct(req.params.id, req.user.id);
  res.json(result);
});

exports.uploadSellerVariantImages = asyncHandler(async (req, res) => {
  const variant = await sellerService.uploadSellerVariantImages(
    req.params.id,
    req.params.variantId,
    req,
    req.user.id
  );

  res.json({ message: "Variant images uploaded successfully", variant });
});
