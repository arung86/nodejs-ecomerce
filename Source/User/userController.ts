var validator = require('validator'),
    helper = require('../helper'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    user = require('./userModel');
module.exports = function (app, io) {
    io.on('connection', function (socket) {
        socket.on('user_is_logging', function (data) {
            socket.user = data;
            socket.broadcast.emit('user_online', JSON.parse(data));
        });
        socket.on('forceDisconnect', function () {
            if (typeof this.user != 'undefined') {
                socket.broadcast.emit('user_offline', JSON.parse(this.user));
            }
        });
        socket.on('disconnect', function () {
            if (typeof this.user != 'undefined') {
                socket.broadcast.emit('user_offline', JSON.parse(this.user));
            }
        });
    });

    app.get('/user', helper.handleRequest(user.listUser));
    app.get('/user/:userId', helper.handleRequest(user.showUserById));
    app.get('/get-total-user', helper.handleRequest(user.totalUser));
    app.post('/user', helper.handleRequest(user.saveUser));
    app.delete('/user/:userId', helper.handleRequest(user.deleteUser));

    // Front-end Call
    app.post('/registerUser', function (req, res) {
        if (typeof req.body != 'undefined') {
            var saveUserPromise = new Promise(function (resolve, reject) {
                user.once('save_user', function (userId) {
                    if (+userId) {
                        resolve(+userId);
                    } else {
                        reject();
                    }
                });
                user.saveUser(Object.assign(req.body, {
                    group: 3
                }));
            });
            saveUserPromise.then(function (userId) {
                return new Promise(function (resolve, reject) {
                    user.once('show_user', function (result) {
                        if (result.success) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    });
                    user.showUserById(userId);
                });
            }).then(function (result) {
                return new Promise(function (resolve, reject) {
                    helper.sendEmail(result.user.email,
                        '[Apt Shop] Confirm your password',
                        'Click this url to confirm your registed : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/confirmRegisted?id=' + result.user.id + '&salt=' + result.user.salt, function (error, response) {
                            if (error) {
                                reject();
                                throw error;
                            } else {
                                res.json({
                                    success: true
                                });
                            }
                        });
                });
            }).catch(function () {
                res.json({
                    success: false,
                    errorCode: 8
                });
            });
        }
    });

    app.get('/confirmRegisted', function (req, res) {
        if (typeof req.query.id != 'undefined' && typeof req.query.salt != 'undefined') {
            var id = req.query.id;
            var salt = req.query.salt;
            user.once('get_user', function (userDatas) {
                var userData = helper.getFirstItemArray(userDatas);
                if (+userData.group == user.UNCONFIRM) {
                    if (userData && delete userData.salt) {
                        userData.group = user.CUSTOMER;
                        user.once('save_user', function () {
                            res.json({
                                success: true,
                                hash: helper.encodeBase64(JSON.stringify(userData))
                            });
                        });
                        user.saveUser(userData);
                    } else
                        res.json({
                            success: false
                        });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser({
                salt: salt,
                id: id
            });
        } else {
            res.json({
                success: false
            });
        }
    });

    app.post('/userLogin', function (req, res) {
        if (typeof req.body != 'undefined') {
            user.once('user_login', function (result) {
                if (false != result) {
                    res.json({
                        success: true,
                        hash: helper.encodeBase64(JSON.stringify(result))
                    });
                } else {
                    res.json({
                        success: false
                    });
                }

            });
            user.userLogin(req.body);
        }
    });

    app.post('/forgotPassword', function (req, res) {
        if (typeof req.body != 'undefined') {
            user.once('get_user', function (results) {
                var userData = helper.getFirstItemArray(results);
                if (typeof userData != 'undefined') {
                    helper.sendEmail(userData.email,
                        '[Apt Shop] Update your new password',
                        'Click this url to update your password : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/updatePassword?id=' + userData.id, function (error) {
                            if (error) {
                                throw error;
                            } else {
                                res.json({
                                    success: true
                                });
                            }
                        });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser(req.body);
        }
    });

    // Validate all request
    app.get('/validate-user', function (req, res) {
        if (!_.isUndefined(req.query.username)) {
            if (validator.isAlphanumeric(req.query.username)) {
                user.validateUser(req.query).then(function (isExisted: boolean) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            message: 'Username is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            } else {
                res.json({
                    isNotValid: true,
                    message: 'Username contains special character or space'
                });
            }
        }
        if (!_.isUndefined(req.query.email)) {
            if (validator.isEmail(req.query.email)) {
                user.validateUser(req.query).then(function (isExisted: boolean) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            message: 'Email is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            } else {
                res.json({
                    isNotValid: true,
                    message: 'Email is wrong format'
                });
            }
        }
        if (!_.isUndefined(req.query.phone)) {
            if (!validator.isMobilePhone(req.query.phone, 'vi-VN')) {
                res.json({
                    isNotValid: true,
                    message: 'Phone number is wrong format'
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }
        }
        if (!_.isUndefined(req.query.password)) {
            if (!validator.isAlphanumeric(req.query.password)) {
                res.json({
                    isNotValid: true,
                    message: 'Password is wrong format'
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }

        }
    });
};
