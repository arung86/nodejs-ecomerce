var connection = require('../../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
function User() { };
var _User = new User();
User.prototype.listUser = function (params: { limit: number, offset: number, orderBy: string, sort: string, username?: string }): any {
    return new Promise(function (resolve, reject) {
        var sql = helper.buildQuery
            .select(['id', 'email', 'username', 'group', 'street', 'city', 'country', 'state', 'zipcode'])
            .from('apt_user');
        var condition: string = (typeof params.username != 'undefined') ? '`username` LIKE "%' + params.username + '%"' : '';
        if (condition) {
            sql = sql.where(condition);
        }
        sql = sql.orderBy(params.orderBy, params.sort).limit(+params.limit, +params.offset).render();
        connection.query(sql, (err, users) => {
            if (err) reject();
            var listUsers = [];
            for (var user of users) {
                user.address = user.street + ',' + user.city + ',' + user.country + ',' + user.state + ',' + user.zipcode;
                user = _.omit(user, ['street', 'city', 'country', 'state', 'zipcode']);
                listUsers.push(user);
            }
            resolve(listUsers);
        });
    });
};
User.prototype.saveUser = function (user) {
    return new Promise(function (resolve, reject) {
        if (!_.isUndefined(user.password)) {
            user.salt = helper.randomString();
            user.password = helper.encodeBase64(user.password) + user.salt;
        }
        if (!_.isUndefined(user.id)) {
            connection.query('UPDATE `apt_user` SET ? WHERE `id` = ?', [user, user.id], function (err, res) {
                if (err) reject(err);
                resolve((res.changedRows) ? true : false);
            });
        } else {
            connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
                if (err) reject(err);
                resolve(res.insertId);
            });
        }
    });
};
User.prototype.showUserById = function (params: { userId: number }) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
            'FROM `apt_user` WHERE `id` = ?', [params.userId], (err, rows) => {
                if (err) reject();
                resolve((!_.isUndefined(rows[0].id)) ? rows[0] : {});
            });
    });
};
User.prototype.deleteUser = function (params: { userId: number }) {
    return new Promise(function (resolve, reject) {
        connection.query('DELETE FROM `apt_user` WHERE `id` = ?', [params.userId], function (err, res) {
            resolve({ success: (res.affectedRows) ? true : false });
        });
    });
};
User.prototype.validateUser = function (field) {
    return new Promise(function (resolve, reject) {
        var sql: string, param: string[];
        if (!_.isUndefined(field.username)) {
            if (!_.isUndefined(field.userId)) {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ? AND `id` != ?';
                param = [field.username, field.userId]
            } else {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ?';
                param = [field.username]
            }
        }
        if (!_.isUndefined(field.email)) {
            if (!_.isUndefined(field.userId)) {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ? AND `id` != ?';
                param = [field.email, field.userId]
            } else {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ?';
                param = [field.email]
            }
        }
        connection.query(sql, param, function (err, rows) {
            resolve((!err && rows[0].countUser));
        });
    });
};
User.prototype.totalUser = function () {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT COUNT(*) as total FROM `apt_user`', function (err, rows) {
            if (err) reject();
            resolve(rows[0]);
        });
    });
};
User.prototype.userLogin = function (data) {
    var self = this;
    var sql = connection.format('SELECT `id`, `password`, `salt`, `email`, `username`, `group`, `street`,' +
        ' `registered`, `city`, `country`, `state`, `zipcode` FROM `apt_user` WHERE `username` = ? AND `group` !=  5', data.username);
    connection.query(sql, function (err, rows) {
        if (rows[0]) {
            var encryptPassword = helper.encodeBase64(data.password) + rows[0].salt;
            if (encryptPassword === rows[0].password && delete rows[0].password) {
                self.emit('user_login', rows[0]);
            } else {
                self.emit('user_login', false);
            }
        } else {
            self.emit('user_login', false);
        }
    });
};
User.prototype.getUser = function (options) {
    return new Promise(function (resolve, reject) {
        var condition = _perpareCondition(options);
        if (condition) {
            connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`,' +
                ' `registered`, `city`, `country`, `state`, `zipcode`' +
                'FROM `apt_user` WHERE ' + condition, function (err, rows) {
                    if (err) { reject(err); }
                    else {
                        resolve(rows);
                    }
                });
        } else {
            reject();
        }
    });
};
User.prototype.registerUser = function (user) {
    return new Promise((resolve, reject) => {
        _User.saveUser(user).then(function (userId) {
            if (userId) {
                helper.sendEmail(user.email,
                    '[Apt Shop] Confirm your password',
                    'Click this url to confirm your registed : ' +
                    'http://localhost/APTshop/#/confirmRegisted?id=' + userId + '&salt=' + user.salt, function (error, response) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(true);
                        }
                    });
            } else {
                reject();
            }
        }).catch(function () {
            reject();
        });
    });
};
User.prototype.confirmRegisted = function (params) {
    return new Promise(function (resolve, reject) {
        _User.getUser(params).then(function (users) {
            var user = helper.getFirstItemArray(users);
            if (+user.group == 5) {
                // if (userData && delete userData.salt) {
                //     userData.group = user.CUSTOMER;
                //     user.once('save_user', function () {
                //         res.json({
                //             success: true,
                //             hash: helper.encodeBase64(JSON.stringify(userData))
                //         });
                //     });
                //     user.saveUser(userData);
                // } else
                //     res.json({
                //         success: false
                //     });
                user.group = 2;
                user.saveUser(user).then(function(result){
                    
                }).catch(function(){
                    reject();
                });
            } else {
                reject();
            }
        }).catch(function () {

        });
    });
};
var _perpareCondition = function (conditions) {
    var condition = '';
    for (var index in conditions) {
        if (condition) {
            condition += ' AND ';
        }
        condition += connection.format('`' + index + '` = ?', [conditions[index]]);
    }

    return condition;
};
module.exports = _User;