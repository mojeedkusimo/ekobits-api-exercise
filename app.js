const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const morgan = require("morgan");

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json());


app.use('/api/users', routes);

app.get('/api', (req, res, next) => {
    try {
        res.send('Welcome to Deployed Api exercise');
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

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running....')
})