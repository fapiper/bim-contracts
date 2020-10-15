const express = require('express');
const router = express.Router();
const projectCtrl = require('@server/controllers/project.controller');

router.route('/').get(projectCtrl.list).post(projectCtrl.create);

router
  .route('/:id')
  .get(projectCtrl.get)
  .put(projectCtrl.update)
  .delete(projectCtrl.remove);

module.exports = router;
