const express = require('express');
const router = express.Router();

const helloWorldController = require('./controllers/helloWorldController');
const guestBookController = require('./controllers/guestBookController');

router.get('/', helloWorldController.sayHello);
router.post('/guestbook', guestBookController.sign);

module.exports = router;
