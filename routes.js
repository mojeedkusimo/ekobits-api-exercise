const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

let secretKey = 'secret';
// let id = 0;
// let users = [];

let adminRouteOnly = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let authKey = req.headers.authorization.split(" ")[1];
        
            const token = jwt.verify(authKey, secretKey);
    
            // if(token.user.isadmin) {
            //
            if(token.userObj.isadmin) {
            console.log("success " + token);
                return next();
            } else {
                console.log("failed " + token.userObj.isadmin);
                return res.send(token.userObj.username + " User has no access...")
                // return res.send(token.user.username + " User has no access...")
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
    
            // if(token.user.isadmin || token.user.id === Number(req.params.id)) {
            if(token.userObj.isadmin || token.userObj.id === Number(req.params.id)) {
                console.log("success " + token);
                return next();
            } else {
                console.log("failed " + token);
                return res.send(token.userObj.username + " Unauthorized User!!!");
                // return res.send(token.user.username + " Unauthorized User!!!");
                
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
    .get(adminRouteOnly, async (req, res, next) => {
        try {
            //
            let users = await db.query("SELECT * FROM users");
            return res.json(users.rows); 
            //
            return res.json(users);
        }
        catch (e) {
            return next(e);
        }
    })
    .post(async (req, res, next) => {
        try {
            let { username, password, isadmin } = req.body;
    
            // let user = {};
            // user.id = ++id;
            // user.username = username;
    
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            //
            let user = await db.query("INSERT INTO users (username, password, isadmin) VALUES ($1, $2, $3) RETURNING *", [username, hashedPassword, isadmin]);

            let userObj = user.rows[0];
            const token = jwt.sign({userObj}, secretKey, {
                expiresIn: 60 * 60
            })

            console.log(token);
            return res.status(201).json(userObj);
            //
            // user.password = hashedPassword;

            
            // users.push(user);
    
            // user.isadmin = isadmin;
    
            // const token = jwt.sign({user}, secretKey, {
            //     expiresIn: 60 * 60
            // })
            // console.log(token);
            // return res.status(201).json(user);
    
        }
        catch (e) {
            return next(e);
        }
    })

router.post('/login', async (req, res, next) => {
    try {
        let { username, password } = req.body;
            //
            let user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
            let userObj = user.rows[0];
            //
        // let user = users.find(val => val.username === username);

        // if (user !== undefined) {
        //
        if (userObj !== undefined) {
            const isMatch = await bcrypt.compare(password, userObj.password)
        //
            // const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {
                //
                const token = jwt.sign({userObj}, secretKey, {
                    expiresIn: 10 * 60
                })
                //
                // const token = jwt.sign({user}, secretKey, {
                //     expiresIn: 10 * 60
                // })
                console.log(token);
                return res.json({
                    status: 200,
                    message: `${user.username} logged in successfully`,
                    //
                    message: `${userObj.username} logged in successfully`
                    //
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
    .get(adminAndUserRouteOnly, async (req, res, next) => {
        try {
            //
            let user = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
            let userObj = user.rows[0];

            console.log(userObj)
            return res.json(userObj);
            //
            // let user = users.find(val => val.id === Number(req.params.id));
            
            // console.log(user)
            // return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    })
    .patch(adminAndUserRouteOnly, async (req, res, next) => {
        try {
            //
            let user = await db.query("UPDATE users SET username = $1 WHERE id = $2 RETURNING *", [req.body.username, req.params.id]);
            let userObj = user.rows[0];

            console.log(userObj)
            return res.json(userObj);
            //
            // let user = users.find(val => val.id === Number(req.params.id));

            // user.interest = req.body.interest;
            
            // return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    })
    .delete(adminAndUserRouteOnly, async (req, res, next) => {
        try {
            //
            let user = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [req.params.id]);
            let userObj = user.rows[0];

            console.log(userObj)
            return res.json(userObj);
            //
            let userIndex = users.findIndex((val => val.id === Number(req.params.id)));

            let deletedUser = users.splice(userIndex, 1);
            
            return res.json(deletedUser);
        }
        catch (e) {
            return next(e);
        }
    })

module.exports = router;