const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const compression = require('compression');

const homeRoute = require('./routes/home');
const coursesRoute = require('./routes/courses');
const addRoute = require('./routes/add-course');
const cartRoute = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const varMiddleware = require('./middleware/variables');
const userMiddleWare = require('./middleware/user');
const errorMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const keys = require('./keys');

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: require('./utils/hbs-helpers')
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
});

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(fileMiddleware.single('avatar'));
app.use(helmet()); // adds secure headers to requests
app.use(
    helmet.permittedCrossDomainPolicies({
        permittedPolicies: "by-content-type",
    })
);
app.use(compression());
app.use(csurf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleWare);


app.use('/', homeRoute);
app.use('/courses', coursesRoute);
app.use('/add-course', addRoute);
app.use('/cart', cartRoute);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorMiddleware);

async function start() {

    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Service is running on port ${PORT}`);
        });
    } catch(e) {
        console.log(e);
    }

}

start();

