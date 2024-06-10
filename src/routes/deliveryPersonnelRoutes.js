const express = require('express');
const router = express.Router();
const {
    getAllPersonnel,
    getPersonnelById,
    addPersonnel,
    filterPersonnel,
    updatePersonnel,
} = require('../controllers/deliveryPersonnel');

router.get('/', getAllPersonnel);
router.get('/:id', getPersonnelById);
router.post('/', addPersonnel);
router.put('/:id', updatePersonnel);
router.get('/filter', filterPersonnel);

module.exports = router;