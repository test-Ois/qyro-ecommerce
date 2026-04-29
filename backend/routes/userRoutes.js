const express = require("express");

const {
  getUsers,
  deleteUser,
  toggleUserBlock
} = require("../controllers/userController");

const auth = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", auth, roleMiddleware("admin"), getUsers);
router.delete("/:id", auth, roleMiddleware("admin"), deleteUser);
router.put("/:id/block", auth, roleMiddleware("admin"), toggleUserBlock);

module.exports = router;

