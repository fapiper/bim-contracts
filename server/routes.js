const express = require('express');
const router = express.Router();

const CONTROLLER_DIR = 'controllers';

const helloWorldController = require(`./${CONTROLLER_DIR}/helloWorldController`);

router.get('/', helloWorldController.sayHello);

module.exports = router;
