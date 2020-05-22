var express = require('express');
var router = express.Router();
const internal = require('../app/internal');
const framework = require('../app/framework');
/* GET home page. */
router.get('/', function (req, res, next) {
    if (global.connected === false) {
        return res.redirect('/loading');
    }
    res.render('home', {author: global.moduleConfig.identity.name});
});
router.post('/status', async function (req, res, next) {
    return res.json({status: global.connected});
});
router.get('/loading', async function (req, res, next) {
    return res.render('loading');
});

router.post('/getmessages', async function (req, res, next) {
  try {
    let result = await internal.RetrieveMessage();
    return res.json(result);

  } catch (e) {
    console.log('Unable to retrieve messages:', e.toString());
    return res.json({status: false});

  }
});
router.post('/sendmessage', async function (req, res, next) {
  try {
    let result = await internal.SendMessage(req.body.sender, req.body.recipient, req.body.message, req.body.time);
    return res.json({result});

  } catch (e) {
    console.log('Unable to send message:', e.toString());
    return res.json({status: false});

  }

});

router.post('/get-shared-data', async function (req, res, next) {
    return res.json(await framework.RetrieveSharedData());
});

module.exports = router;
