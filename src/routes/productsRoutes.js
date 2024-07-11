const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByVendor,
} = require("../controllers/productsController");


router.route("/:vendorId")
    .get(getProductsByVendor);

router.route("/")
    .get(getAllProducts)
    .post(createProduct);

router.post('/uploadImage', uploadImage);
    
router.route("/product/:id")
    .get(getSingleProduct)

router.route("/:id")
    .patch(updateProduct)
    .delete(deleteProduct);

    

module.exports = router;