const express = require('express');
const { waterIntake, calorieRequirement } = require('../controllers/toolsController');

const router = express.Router();

router.post('/water-intake', waterIntake);
router.post('/calorie-requirement', calorieRequirement);

module.exports = router;
