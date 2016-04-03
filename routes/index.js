var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var dataSchema = new mongoose.Schema({
    title: {type: String},
    data: {type: Object}
});
var Data = mongoose.model('Data', dataSchema);


/* GET home page. */
router.get('/', function(req, res, next) {
  //var data = new Data({
  //    title: 'test1',
  //    data: {all:'2'}
  //});
  //data.save(function(err, data) {
  //    if(err) {
  //      console.log(err);
  //    }else {
  //      console.log(data);
  //    }
    console.log("Got to routs");
      res.send('hello');
      //res.send('hello world');
  //});

  //res.render('index', { title: 'Express' });
});

router.post('/post_data', function(req, res, next) {
    console.log("get");
    var plistData = req.body.data;
    var plistName = req.body.name;
    var data = new Data({
        title: plistName,
        data: plistData
    });
    data.save(function(err, data) {
        if(err) {
            return res.json({error: err.message});
        }
        res.json({success: true})
    })

});

router.get('/get_data', function(req, res, next) {
    console.log('got to get data');
    console.log('body ', req.body);
    var plistName = req.body.name;
    data.findByTitle(plistName, function(err, foundData) {
        if(err) {
            console.log('err: ', err.message);
            return res.json({error: err.message});
        }
        if(!foundData) {
            console.log('nothing found');
            return res.json({error: 'no data found'});
        }
        console.log('data: ', foundData);
        res.json({success:true, data: foundData});
    })
});


module.exports = router;
