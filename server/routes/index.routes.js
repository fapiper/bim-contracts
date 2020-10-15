const express = require('express');
const router = express.Router();

router.use('/users', require('@server/routes/user.routes'));
router.use('/projects', require('@server/routes/project.routes'));

module.exports = router;
