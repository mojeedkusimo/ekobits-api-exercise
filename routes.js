const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

let secretKey = 'secret';
let id = 0;
let users = [];

let adminRouteOnly = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let authKey = req.headers.authorization.split(" ")[1];
        
            const token = jwt.verify(authKey, secretKey);
    
            if(token.user.isAdmin) {
                return next();
            } else {
                return res.send(token.user.username + " User has no access...")
            }
        }
         else {
            return res.send("Kindly log in...")
        }
    }
    catch (e) {
        return next(e);
    }
}

let adminAndUserRouteOnly = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let authKey = req.headers.authorization.split(" ")[1];

            const token = jwt.verify(authKey, secretKey);
    
            if(token.user.isAdmin || token.user.id === Number(req.params.id)) {
                return next();
            } else {
                return res.send(token.user.username + " Unauthorized User!!!");
                
            }
        }
        else {
            return res.send("You are not logged in");
        }
    }
    catch (e) {
        return next(e);
    }
}

router
    .route("/")
    .get(adminRouteOnly, (req, res, next) => {
        try {
            res.json(users);
        }
        catch (e) {
            return next(e);
        }
    })
    .post(async (req, res, next) => {
        try {
            let { username, password, isAdmin } = req.body;
    
            let user = {};
            user.id = ++id;
            user.username = username;
    
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            user.password = hashedPassword;
            users.push(user);
    
            user.isAdmin = isAdmin;
    
            const token = jwt.sign({user}, secretKey, {
                expiresIn: 60 * 60
            })
            console.log(token);
            return res.status(201).json(user);
    
        }
        catch (e) {
            return next(e);
        }
    })

router.post('/login', async (req, res, next) => {
    try {
        let { username, password } = req.body;

        let user = users.find(val => val.username === username);

        if (user !== undefined) {
            const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {
                const token = jwt.sign({user}, secretKey, {
                    expiresIn: 10 * 60
                })
                console.log(token);
                return res.json({
                    status: 200,
                    message: `${user.username} logged in successfully`
                });    
            }
            return res.json({
                status: 400,
                message: "Invalid password"
            });
        }
        return res.json({
            status: 400,
            message: "Invalid username"
        });
    }
    catch (e) {
        return next(e);
    }
});

router
    .route('/:id')
    .get(adminAndUserRouteOnly, (req, res, next) => {
        try {
            let user = users.find(val => val.id === Number(req.params.id));
            
            console.log(user)
            return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    })
    .patch(adminAndUserRouteOnly, (req, res, next) => {
        try {
            let user = users.find(val => val.id === Number(req.params.id));

            user.interest = req.body.interest;
            
            return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    })
    .delete(adminAndUserRouteOnly, (req, res, next) => {
        try {
            let userIndex = users.findIndex((val => val.id === Number(req.params.id)));

            let deletedUser = users.splice(userIndex, 1);
            
            return res.json(deletedUser);
        }
        catch (e) {
            return next(e);
        }
    })

module.exports = router;