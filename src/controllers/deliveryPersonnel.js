const DeliveryPersonnel = require('../models/deliveryPersonnelModel');

const getAllPersonnel = async (req, res) => {
  try {
    const personnel = await DeliveryPersonnel.find();
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching delivery personnel' });
  }
};

const getPersonnelById = async (req, res) => {
  try {
    const personnel = await DeliveryPersonnel.findById(req.params.id);
    if (!personnel) {
      res.status(404).json({ error: 'Delivery personnel not found' });
    } else {
      res.json(personnel);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching delivery personnel' });
  }
};

const addPersonnel = async (req, res) => {
  try {
    const newPersonnel = new DeliveryPersonnel(req.body);
    const savedPersonnel = await newPersonnel.save();
    res.status(201).json(savedPersonnel);
  } catch (error) {
    res.status(400).json({ error: 'Error adding delivery personnel' });
  }
};

const updatePersonnel = async (req, res) => {
  try {
    const updatedPersonnel = await DeliveryPersonnel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPersonnel) {
      res.status(404).json({ error: 'Delivery personnel not found' });
    } else {
      res.json(updatedPersonnel);
    }
  } catch (error) {
    res.status(400).json({ error: 'Error updating delivery personnel' });
  }
};

const filterPersonnel = async (req, res) => {
  const { location, vehicle, price } = req.query;
  const filter = {};

  if (location) {
    filter.location = { $regex: new RegExp(location, 'i') };
  }

  if (vehicle) {
    filter.vehicle = { $regex: new RegExp(vehicle, 'i') };
  }

  if (price) {
    const priceRange = price.split('-');
    const minPrice = priceRange[0] ? parseInt(priceRange[0]) : 0;
    const maxPrice = priceRange[1] ? parseInt(priceRange[1]) : Infinity;
    filter.fee = { $gte: minPrice, $lte: maxPrice };
  }

  try {
    const filteredPersonnel = await DeliveryPersonnel.find(filter);
    res.json(filteredPersonnel);
  } catch (error) {
    res.status(500).json({ error: 'Error filtering delivery personnel' });
  }
};

module.exports = {
    getAllPersonnel,
    getPersonnelById,
    addPersonnel,
    filterPersonnel,
    updatePersonnel,
}