
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  createSkillExchange,
  getSkillExchanges,
  getMySkillExchanges,
  updateSkillExchange,
  deleteSkillExchange
} = require('../controllers/skillController');

router.use(protect);

router.get('/my-listings', getMySkillExchanges);

router.route('/')
  .get(getSkillExchanges)
  .post(createSkillExchange);

router.route('/:id')
  .put(updateSkillExchange)
  .delete(deleteSkillExchange);

module.exports = router;
