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
//   createProductWithImage,
} = require("../controllers/productsController");

router.route("/")
    .post(createProduct)
    .get(getAllProducts);

router.route('/uploadImage')
    .post(uploadImage);
    
router.route("/:id")
    .get(getSingleProduct)
    .patch(updateProduct)
    .delete(deleteProduct);

// router.route("/upload")
//     .post(upload.single('image'), createProductWithImage);
    

module.exports = router;