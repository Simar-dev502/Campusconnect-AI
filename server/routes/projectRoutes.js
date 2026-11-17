
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

router.use(protect);

router.get('/my-projects', getMyProjects);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
