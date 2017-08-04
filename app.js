const express          = require('express');
const path 		         = require('path');
const mongoose         = require('mongoose');
const bodyParser       = require('body-parser');
const session          = require('express-session');
const expressValidator = require('express-validator');
const flash            = require('connect-flash');
const config           = require('./config/database');
const passport         = require('passport');

// Connect to mongodb via mongoose
mongoose.connect(config.database, { useMongoClient:true });
const db = mongoose.connection;

// Check db connection
db.once('open', () => {
  console.log("Connection Succeed !");
}).on('error', (error) => {
  console.log("Connection Error: ", error);
});

// Replace mongoose promise with ES6 promise
mongoose.Promise = global.Promise;

// Init app
const app = express();

// Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Config->passport
require('./config/passport')(passport);
// passportjs middleware
app.use(passport.initialize());
app.use(passport.session());

// Import models
const Article = require('./models/article');

// +++ BodyParser Middleware +++
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// +++ End BodyParser Middleware +++

// Add public folder as static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// +++ Routes +++
// global variable -> ketika user sudah login tidak ada tulisan login/register lagi
app.get('*', (req, res, next) => {
  username : req.body.username;
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) => {
	// fetch data from db
	Article.find({}, (err, articles) => {
		if(err){
			console.log(err);
		}else{
			res.render('index', {
        title: "X-Medium | Extra Medium",
				articles : articles
			});
		}
	});
});

// import routes
const article_routes = require('./routes/article_routes');
const user_routes    = require('./routes/user_routes');

// add some extra route for imported route
app.use('/article', article_routes);
app.use('/user', user_routes);
// +++ End Routes +++


// +++ RUNNING THE SERVER +++
app.listen(3000, () => {
	console.log("Server run on http://localhost:3000 Lets make fireworks!");
});
