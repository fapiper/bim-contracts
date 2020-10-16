const express = require('express');
const router = express.Router();

router.use('/users', require('routes/user.routes'));
router.use('/projects', require('routes/project.routes'));

module.exports = router;
