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
    res.send({'message':'hello'});
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
    if (req.body.length !== 0) {
        return res.send(404, {'message':'have body'});
    }else{
        return res.send(404, {'message':'missing body'});
    }
    //var plistName = req.body.name;
    //data.findByTitle(plistName, function(err, foundData) {
    //    if(err) {
    //        console.log('err: ', err.message);
    //        return res.send(404,{error: err.message});
    //    }
    //    if(!foundData) {
    //        console.log('nothing found');
    //        return res.send(404, {error: 'no data found'});
    //    }
    //    console.log('data: ', foundData);
    //    res.send(200, {success:true, data: foundData});
    //})
});


module.exports = router;
