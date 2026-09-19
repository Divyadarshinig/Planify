const express = require("express");

const {
    getProductivityStats
} = require("../controllers/productivityController");

const protect =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// =========================================================
// 📊 PRODUCTIVITY
// =========================================================

router.get(
    "/",
    protect,
    getProductivityStats
);


module.exports = router;