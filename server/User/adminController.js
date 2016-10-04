var admin = require('./adminModel'), _ = require('lodash'), helper = require('../helper'), session = require('express-session');
module.exports = function (app) {
    app.use(session({
        secret: '123456789',
        resave: false,
        saveUninitialized: true
    }));
    app.post('/admin/login', function (req, res) {
        admin.isAdmin(req.body.username, req.body.password).then(function (result) {
            var loginResult;
            if (result.success) {
                req.session.hash = (!_.isUndefined(result.isSuperAdmin)) ? 'superAdmin' : result.hash;
                loginResult = { success: true, sessionId: req.sessionID };
            }
            else {
                req.session.destroy();
                loginResult = { success: false };
            }
            res.json(loginResult);
        });
    });
    app.get('/admin/checkAdminIsLogin', function (req, res) {
        var loginResult = (!_.isUndefined(req.query.sessionId) && req.query.sessionId == req.sessionID);
        res.json({ success: loginResult });
    });
    app.get('/admin/checkIsSuperAdmin', function (req, res) {
        res.json({
            success: !_.isUndefined(req.query.sessionId)
                && req.query.sessionId == req.sessionID
                && req.session.hash == 'superAdmin'
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5Db250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vU291cmNlL1VzZXIvYWRtaW5Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFDL0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFDckIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFDN0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxHQUFHO0lBQzFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ1osTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixpQkFBaUIsRUFBRSxJQUFJO0tBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN2QyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsTUFBTTtZQUNyRSxJQUFJLFdBQWtCLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUN0RixXQUFXLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDOUQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLFdBQVcsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2xELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ0wsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQzttQkFDekMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVM7bUJBQ3BDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLFlBQVk7U0FDdEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMifQ==