var express = require('express');
var router = express.Router();
var async = require('async');

var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

var dataSchema = new mongoose.Schema({
    title: {type: String},
    data: {type: Object},
    groupId: {type: String}
});
var Data = mongoose.model('Data', dataSchema);

var groupSchema = new mongoose.Schema({
    groupId: {type: String},
    password: {type: Object}
});
var Group = mongoose.model('Group', groupSchema);

router.post('/group', function(req, res) {
    if (!req.body.groupId) {
        return res.send(404, {'error': 'missing group id'});
    }
    if (!req.body.password) {
        return res.send(404, {'error': 'missing password'});
    }
    var groupId = req.body.groupId;
    var password = bcrypt.hashSync(req.body.password, salt);

    async.waterfall([
        function(cb) {
            Data.find({groupId: groupId}, function(err, foundData) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(foundData.length !== 0) {
                    return cb({message: 'group already exist', code: 400})
                }
                cb();
            })
        },
        function(cb) {
            var group = new Group({
                groupId: groupId,
                password: password
            });
            group.save(function(err) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                cb(null, {'data': 'group created successfully'})
            })
        }
    ], function(err, success) {
        if(err) {
            return res.send(err.code, {'error':err.message});
        }
        res.send(200, success)
    })
});

router.post('/group/:groupId/data/:name', function(req, res) {
    if(!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    if(!req.body.data) {
        return res.send(404, {'error':'missing data'});
    }
    if(!req.params.groupId) {
        return res.send(404, {'error':'missing group id'});
    }
    if(!req.body.password) {
        return res.send(404, {'error':'missing password'});
    }
    var groupId = req.params.groupId;
    var password = req.body.password;
    var plistName = req.params.name;
    var plistData = req.body.data;
    var newPlaylist = false;

    async.waterfall([
        function(cb) {
            Group.find({groupId:groupId}, function(err, group) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(group.length === 0) {
                    return cb({message: 'group doesn\'t exist', code:404});
                }
                if(!bcrypt.compareSync(password, group[0].password)) {
                    return cb({message: 'Wrong Password', code: 401});
                }
                cb();
            })
        },
        function(cb) {
            Data.find({title: plistName, groupId: groupId}, function(err, foundData) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(foundData.length === 0) {
                    newPlaylist = true;
                    var data = new Data({
                        title: plistName,
                        data: plistData,
                        groupId: groupId
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
                    return cb({message: err.message, code: 500});
                }
                if(!newPlaylist) {
                    cb(null, {'data': 'upload successful'})
                }else{
                    cb(null, {'data': 'new playlist upload successful'})
                }
            })
        }
    ], function(err, success) {
        if(err) {
            return res.send(err.code, {'error':err.message});
        }
        res.send(200, success)
    });
});


router.post('/data/:name', function(req, res) {
    if(!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    if(!req.body.data) {
        return res.send(404, {'error':'missing data'});
    }
    var plistData = req.body.data;
    var plistName = req.params.name;
    var newPlaylist = false;

    async.waterfall([
        function(cb) {
            Data.find({title: plistName, groupId: "public"}, function(err, foundData) {
                if(err) {
                    return cb({'error': err.message});
                }
                if(foundData.length === 0) {
                    newPlaylist = true;
                    var data = new Data({
                        title: plistName,
                        data: plistData,
                        groupId: "public"
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

router.get('/group/:groupId/data/:name', function(req, res) {
    if (!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    if (!req.params.groupId) {
        return res.send(404, {'error':'missing group id'});
    }
    if (!req.query.password) {
        return res.send(404, {'error':'missing password'});
    }
    var plistName = req.params.name;
    var groupId = req.params.groupId;
    var password = req.query.password;

    async.waterfall([
        function(cb) {
            Group.find({groupId:groupId}, function(err, group) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(group.length === 0) {
                    return cb({message: 'group doesn\'t exist', code:404});
                }
                if(!bcrypt.compareSync(password, group[0].password)) {
                    return cb({message: 'Wrong Password', code: 401});
                }
                cb();
            })
        },
        function(cb) {
            Data.find({title: plistName, groupId: groupId}, function(err, foundData) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(foundData.length === 0) {
                    var message = 'no data found for: ' + plistName +' in ' + groupId;
                    return cb({message: message, code: 401});
                }
                cb(null, foundData[0]);
            })
        }
    ], function(err, data) {
        if(err) {
            return res.send(err.code, {'error':err.message});
        }
        res.send(200, data)
    })
});

router.get('/data/:name', function(req, res) {
    if (!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    var plistName = req.params.name;
    Data.find({title: plistName, groupId: "public"}, function(err, foundData) {
        if(err) {
            return res.send(500,{'error': err.message});
        }
        if(foundData.length === 0) {
            var message = 'no data found for: ' + plistName;
            return res.send(404, {'error': message});
        }
        res.send(200, foundData[0]);
    })
});


router.delete('/data/:name', function(req, res) {
    if (!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    var plistName = req.params.name;
    Data.find({title: plistName, groupId:'public'}, function(err, foundData) {
        if (err) {
            return res.send(500,{'error':err.message});
        }
        if (foundData.length === 0) {
            var message = 'no data found for: ' + plistName;
            return res.send(404, {'error': message});
        }
        foundData[0].remove(function(error) {
            if(error) {
                return res.send(500, {'error': error.message});
            }
            var message = plistName + ' is successfully deleted';
            res.send(200, {'data':message});
        })
    })
});

router.delete('/group/:groupId/data/:name', function(req, res) {
    if (!req.params.name) {
        return res.send(404, {'error':'missing name'});
    }
    if(!req.params.groupId) {
        return res.send(404, {'error':'missing group id'});
    }
    if(!req.body.password) {
        return res.send(404, {'error':'missing password'});
    }
    var plistName = req.params.name;
    var groupId = req.params.groupId;
    var password = req.body.password;

    async.waterfall([
        function(cb) {
            Group.find({groupId:groupId}, function(err, group) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(group.length === 0) {
                    return cb({message: 'group doesn\'t exist', code:404});
                }
                if(!bcrypt.compareSync(password, group[0].password)) {
                    return cb({message: 'Wrong Password', code: 401});
                }
                cb();
            })
        },
        function(cb) {
            Data.find({title: plistName, groupId: groupId}, function(err, foundData) {
                if(err) {
                    return cb({message: err.message, code: 500});
                }
                if(foundData.length === 0) {
                    var message = 'no data found for: ' + plistName +' in ' + groupId;
                    return cb({message: message, code: 401});
                }
                cb(null, foundData[0]);
            })
        },
        function(data, cb) {
            data.remove(function(err) {
                if (err) {
                    return cb(err);
                }
                var message = plistName + ' in ' + groupId + ' is successfully deleted';
                cb(null, {'data':message});
            })
        }
    ], function(err, message) {
        if(err) {
            return res.send(err.code, {'error':err.message});
        }
        res.send(200, message)
    })
});

module.exports = router;
