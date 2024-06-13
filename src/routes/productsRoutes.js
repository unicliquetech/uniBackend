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
//   createProductWithImage,
} = require("../controllers/productsController");


router.route("/:vendorId")
    .get(getProductsByVendor);

router.route("/")
    .get(getAllProducts)
    .post(createProduct);

    // const uploadSingle = upload.single('image');
router.post('/uploadImage', uploadImage);
    
router.route("/:id")
    .get(getSingleProduct)
    .patch(updateProduct)
    .delete(deleteProduct);

// router.route("/upload")
//     .post(upload.single('image'), createProductWithImage);
    

module.exports = router;