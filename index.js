const express=require('express');
const app=express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
const blogPostArray=require("./data");
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
app.use(bodyParser.urlencoded({extended:true}));
require('dotenv').config();
const mongoURL=process.env.MongoURL;
mongoose.connect(mongoURL, {
  serverSelectionTimeoutMS: 30000, 
  socketTimeoutMS: 45000, 
}).then(()=>{
  console.log("connected to mongoDB");
}).catch((err)=>{
  console.log("error in connection",err);
});
const blogSchema = new mongoose.Schema({
   title:String,
   imageURL:String,
   description:String
});
const Blog=new mongoose.model("blog",blogSchema);
const signupSchema = new mongoose.Schema({
  email:String,
  password:String
});
const User=new mongoose.model("User",signupSchema);
app.get('/', (req, res) => {
  res.render('login');
});
app.post('/', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
      .then((user) => {
          if (!user) {
              console.log('User not found');
              return res.redirect('/');
          }

          // Check if the password matches
          if (user.password === password) {
              console.log('User authenticated');
              return res.redirect('/home');
          } else {
              console.log('Invalid password');
              return res.redirect('/');
          }
      })
      .catch((err) => {
          console.error('Error finding user:', err);
          return res.status(500).json({ error: 'Internal server error' });
      });
});


app.get('/signup', (req, res) => {
  res.render('signup');
});
app.post('/signup', (req, res) => {
  Email=req.body.email;
  Password=req.body.password
  const user=new User({
    email:Email,
    password:Password
  })
  user.save().then(()=>{
    console.log("User data saved sucesfully");
  })
  .catch((err)=>{
    console.log("Cannot find blogs");
  })
  res.redirect('/')
});

app.get('/home', (req, res) => {
  Blog.find({})
  .then((arr)=>{
    res.render("index",{blogPostArray:arr});
  }).catch((err)=>{
     console.log("error saving users data");
     res.render(404)
  });
  app.get('/404', (req, res) => {
    res.render('404');
  });
  });
  app.get('/about', (req, res) => {
    res.render('about');
  });
  app.get('/contact', (req, res) => {
    res.render('contact');
  });
  app.get('/post/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Blog.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.render('post', { post: post });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
  });

  app.delete('/post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        await Blog.findByIdAndDelete(postId);
        
        res.status(204).end(); 
    } catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
});

  app.get('/compose', (req, res) => {
    res.render('compose');
  });
  app.post('/compose',(req,res)=>{
    const newID=blogPostArray.length+1
    const image=req.body.imageUrl
    const title=req.body.title
    const description=req.body.description

    const newBlog=new Blog({
      imageURL:image,
      title:title,
      description:description
     })
    newBlog.save().then(()=>{
      console.log("Blog posted successfully");
    }).catch((err)=>{
      console.log("error posting new blog",err);
    });
    res.redirect('/home');
  });
const port=3000 || process.env.PORT;
app.listen(port,()=>{
    console.log('server is running on port 3000')
})