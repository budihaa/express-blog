const express = require('express');
const router  = express.Router();

// Import models
const Article = require('../models/article');
const User 		= require('../models/user');

// Add New Article
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('add_article', {
    title: "New Story | X-Medium"
  });
});
router.post('/add', (req, res) => {
  // validation
  req.checkBody('title', 'Title is required!').notEmpty()
  // req.checkBody('author', 'Author is required!').notEmpty();
  req.checkBody('body', 'Body is required!').notEmpty();

  // get errors
  const errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title   : "New Story | X-Medium",
      errors  : errors
    });
  }else{
    // saving to DB
    const newArticle  = new Article;
    newArticle.title  = req.body.title;
    newArticle.author = req.user._id;
    newArticle.body   = req.body.body;
    // Save to DB
    newArticle.save((err) => {
        if(err){
          console.log(err);
          return;
        }else{
          // flash message
          req.flash('success', 'Your story has been added!');
          res.redirect('/');
        }
    });
  }
});

// Each article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
		// ngambil user._id jadi user.name lalu show jadi author
		User.findById(article.author, (err, user) => {
			if(err) {
	      console.log(err);
	    }else{
	      res.render('each_article', {
	        article : article,
					author 	: user.name
	      });
	    }
		});
  });
});

// Edit routes
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err);
    }else{
      res.render('edit_article', {
        title: "Edit your Story",
        article : article
      });
    }
  });
});
router.post('/edit/:id', (req,res) => {
  const editArticle = {};
  editArticle.title  = req.body.title;
  // editArticle.author = req.body.author;
  editArticle.body   = req.body.body;
  // Where id = params id
  const query = {_id:req.params.id};
  // Pake model
  Article.update(query, editArticle, (err) => {
      if(err){
        console.log(err);
        return;
      }else{
        // flash message
        req.flash('success', 'Your story has been updated!');
        res.redirect('/');
      }
  });
});

// Delete Routes
router.delete('/delete/:id', (req, res) => {
	// Access Control
	if(!req.user._id){
		return res.status(401).send('Please login');
	}
  const query = {_id: req.params.id};
  Article.findById(req.params.id, (err, article) => {
		if(article.author != req.user._id){
			return res.status(401).send('Please login');
		}else{
			Article.remove(query, (err) => h beli{
		    if (err) {
		      console.log(err);
		    }else{
					// flash message
					req.flash('success', 'Your story has been deleted!');
		      res.send('Succees');
		    }
		  });
		}
	});
});

// Access Control -> routes middleware
// so if user not login can't access the URI
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('danger', "You must log in to continue.");
		res.redirect('/user/login');
	}
};

module.exports = router;
