const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

app.use(bodyParser.json());


app.use('/api/users', routes);

app.get('/api', (req, res, next) => {
    try {
        res.send('Welcome to Api exercise at the office');
    }
    catch (e) {
        return next(e);
    }
})


app.use((req, res, next) => {
    let err = new Error("Page not found");
    res.stautus = 404;

    return next(err);
})


app.use((err, req, res, next) => {
    res.stautus = 500 || err.status;
    res.json({
        message: err.message,
        error: err
    })
})

app.listen(5000, () => {
    console.log('Server is running....')
})