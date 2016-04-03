var express = require('express');
var router = express.Router();
var async = require('async');

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
    if(!req.body.name) {
        return res.send(404, {'message':'missing name'});
    }
    if(!req.body.data) {
        return res.send(404, {'message':'missing data'});
    }
    var plistData = req.body.data;
    var plistName = req.body.name;
    var newPlaylist = false;

    async.waterfall([
        function(cb) {
            Data.find({title: plistName}, function(err, foundData) {
                if(err) {
                    return cb({'error': err.message});
                }
                if(foundData.length === 0) {
                    newPlaylist = true;
                    var data = new Data({
                        title: plistName,
                        data: plistData
                    });
                    return cb(null, data)
                }
                cb(null, foundData[0]);
            })
        },
        function(data, cb) {
            if(!newPlaylist) {
                data.data = plistData;
            }
            data.save(function(err) {
                if(err) {
                    return cb({error: err.message});
                }
                if(!newPlaylist) {
                    cb(null, {'data': 'upload successful'})
                }else{
                    cb(null, {'data': 'new playlist upload successful'})
                }
            })
        }
    ], function(err, success) {
        console.log('err: ',err,' success: ', success);
        if (err) {
            return res.send(500, err);
        }
        res.send(200, success);
    });
});

router.get('/get_data', function(req, res, next) {
    if (!req.query.name) {
        return res.send(404, {'message':'missing name'});
    }
    var plistName = req.query.name;
    Data.find({title: plistName}, function(err, foundData) {
        if(err) {
            return res.send(500,{'error': err.message});
        }
        if(foundData.length === 0) {
            var message = 'no data found for: ' + plistName;
            return res.send(404, {'error': message});
        }
        res.send(200, {'data': foundData});
    })
});


module.exports = router;
