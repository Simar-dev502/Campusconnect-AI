
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments
} = require('../controllers/postController');

router.use(protect);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .put(updatePost)
  .delete(deletePost);

router.post('/:id/like', toggleLike);

router.route('/:id/comments')
  .get(getComments)
  .post(addComment);

module.exports = router;
