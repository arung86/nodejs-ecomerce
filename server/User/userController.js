var validator = require('validator'), helper = require('../helper'), Promise = require('bluebird'), _ = require('lodash'), os = require('os'), user = require('./userModel');
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
    app.post('/register-user', helper.handleRequest(user.registerUser));
    app.get('/confirm-registed', function (req, res) {
        if (!_.isUndefined(req.query.id) || !_.isUndefined(req.query.salt)) {
            user.confirmRegisted(req.query).then(function (result) {
                if (result.success) {
                    res.json({ success: true, sessionId: req.sessionID, current_user: result.current_user });
                }
            }).catch(function () {
                res.status(400).end();
            });
        }
        else {
            res.status(400).end();
        }
    });
    app.post('/user-login', function (req, res) {
        if (!_.isUndefined(req.body.username) || !_.isUndefined(req.body.password)) {
            var passwordEncode = helper.encodeBase64(req.body.password);
            var username = req.body.username;
            var userLoginPromise = user.getUserFirst(['salt'], { username: username });
            userLoginPromise.then(function (userData) {
                return user.userLogin({ username: username, password: passwordEncode + userData.salt });
            }).then(function (result) {
                console.log(result);
                if (result.success) {
                    res.json({ success: true, sessionId: req.sessionID, current_user: result.current_user });
                }
            }).catch(function () {
                console.log('bbb');
                res.status(400).end();
            });
        }
    });
    app.post('/forgotPassword', function (req, res) {
        if (typeof req.body != 'undefined') {
            user.once('get_user', function (results) {
                var userData = helper.getFirstItemArray(results);
                if (typeof userData != 'undefined') {
                    helper.sendEmail(userData.email, '[Apt Shop] Update your new password', 'Click this url to update your password : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/updatePassword?id=' + userData.id, function (error) {
                        if (error) {
                            throw error;
                        }
                        else {
                            res.json({
                                success: true
                            });
                        }
                    });
                }
                else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser(req.body);
        }
    });
    app.get('/validate-user', function (req, res) {
        if (!_.isUndefined(req.query.username)) {
            if (validator.isAlphanumeric(req.query.username)) {
                user.validateUser(req.query).then(function (isExisted) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            rule: 'existed',
                            message: 'Username is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            }
            else {
                res.json({
                    isNotValid: true,
                    rule: 'alphanumberic',
                    message: 'Username contains special character or space'
                });
            }
        }
        if (!_.isUndefined(req.query.email)) {
            if (validator.isEmail(req.query.email)) {
                user.validateUser(req.query).then(function (isExisted) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            rule: 'existed',
                            message: 'Email is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            }
            else {
                res.json({
                    isNotValid: true,
                    rule: 'email',
                    message: 'Email is wrong format'
                });
            }
        }
        if (!_.isUndefined(req.query.phone)) {
            if (!validator.isMobilePhone(req.query.phone, 'vi-VN')) {
                res.json({
                    isNotValid: true,
                    rule: 'phone-number',
                    message: 'Phone number is wrong format'
                });
            }
            else {
                res.json({
                    isNotValid: false
                });
            }
        }
        if (!_.isUndefined(req.query.password)) {
            if (!validator.isAlphanumeric(req.query.password)) {
                res.json({
                    isNotValid: true,
                    rule: 'alphanumberic',
                    message: 'Password is wrong format'
                });
            }
            else {
                res.json({
                    isNotValid: false
                });
            }
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvVXNlci91c2VyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsRUFBRSxFQUFFO0lBQzlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQVUsTUFBTTtRQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsSUFBSTtZQUN2QyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtZQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVB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