const express = require('express');
const router = express.Router();
const userCtrl = require('@server/controllers/user.controller');

router.route('/').get(userCtrl.list).post(userCtrl.create);

router
  .route('/:id')
  .get(userCtrl.get)
  .put(userCtrl.update)
  .delete(userCtrl.remove);

router.route('/:id/projects').get(userCtrl.getUserProjects);

module.exports = router;
