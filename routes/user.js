var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helper');
var router = express.Router();


const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {

  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCount(req.session.user._id)
  }


  productHelpers.viewproducts().then((products) => {


    res.render('user/view-products', { products, cartCount, user })
  })
});
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false;
  }

})
router.get('/signup', (req, res) => {
  res.render('user/signup')

})

router.post('/signup', (req, res) => {
  userHelper.signupF(req.body).then((response) => {
    req.session.user = response
    req.session.user.loggedIn = true;
   
    res.redirect('/')


    res.render('user/login')

  })

})
router.post('/login', (req, res) => {


  userHelper.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.user = response.user
      req.session.user.loggedIn = true;
      
      res.redirect('/')
    } else {
      req.session.loginErr = true;
      res.redirect('/login')
    }

  })


})
router.get('/logout', (req, res) => {
  req.session.user=null
  res.redirect('/')

})

router.get('/profile',(req,res)=>{
  userHelper.getUserDetails(req.session.user._id).then((userdetails)=>{
    res.render('user/profile',{user:req.session.user,userdetails})
  })
 
})


router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCart(req.session.user._id)
  let totalam = 0


  if (products.length > 0) {

    totalam = await userHelper.totalAm(req.session.user._id)
  
  res.render('user/cart', { products, user: req.session.user, totalam })
  }else{
    res.render('user/emptyCart',{user:req.session.user})
  }
})

router.get('/orders', verifyLogin,async(req, res)=>{
  console.log(req.session.user);

 let orders= await userHelper.getAllOrders(req.session.user._id)



    res.render('user/orders', { user:req.session.user,orders })
  

})
router.post('/Cancel',(req,res)=>{

  console.log("c call");
  userHelper.cancelOrder(req.body.order).then((response)=>{

    res.json(response)
    

  })
})


router.get('/add-to-cart/:id', verifyLogin, (req, res) => {


  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect('/')

  })


})


router.post('/change', verifyLogin, async (req, res, next) => {


  userHelper.changeQ(req.body).then(async (response) => {

    response.total = await userHelper.totalAm(req.body.user)
    res.json(response)




  })


})


router.post('/remove', verifyLogin, (req, res, next) => {
  userHelper.removeP(req.body).then((response) => {

    res.json(response)
  })
})

router.get('/placeorder', verifyLogin, async (req, res) => {
  


  let total = await userHelper.totalAm(req.session.user._id)
  res.render('user/placeorder', { total, user: req.session.user })


})


router.post('/place-order',verifyLogin, async (req, res) => {
  let prolist = await userHelper.getProlist(req.body.userId)
  let products = prolist.products
  console.log(products);


  total = await userHelper.totalAm(req.body.userId)


  userHelper.placeOrder(req.body, total,products).then((orderid) => {
    console.log(req.body);
    if (req.body['method'] === 'COD') {
      res.json({ pstatus: true })
    } else {
      userHelper.generateRazor(orderid, total, prolist).then((response) => {
        
        res.json(response)
      })
    }
  })
  router.get('/order-success', verifyLogin, async (req, res) => {
    user = req.session.user

    res.render('user/Order-success', { user })
  })

  router.get('/invoice',verifyLogin, async (req, res) => {
    Odetails = await userHelper.getOrder(req.session.user._id)



    console.log(Odetails);
    res.render('user/invoice', { Odetails, user: req.session.user })
  })

  

  
  router.get('/order-products/:id', verifyLogin, async (req, res) => {
    let products = await userHelper.getOrderedP(req.params.id)
    console.log(req.params.id);
    console.log(products);
    res.render('user/order-products', { products, user:req.session.user })

  })
  

  router.post('/verifyPayment',verifyLogin, (req, res) => {

    console.log(req.body);
     userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changeOstatus(req.body['order[receipt]']).then(()=>{
    res.json({status:true})
    console.log('payment succesfull')
   })

    }).catch((err)=>{
      console.log(err);
      res.json({status:false})
    })
   


  })

 
 

})






module.exports = router;
