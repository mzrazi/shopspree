const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const adminHelper=require('../helpers/adminHelper')

const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedin) {
    

    next()
    
  } else {
    res.redirect('/admin/adminlogin')
  }
}





/* GET users listing. */


router.get('/',verifyLogin, function(req, res, next) {
  productHelpers.viewproducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products})
  })
})
router.get('/adminlogin',(req,res)=>{
  console.log('api call');
    res.render('admin/ALogin',{admin:true})
  })
router.get('/add-products',function(req,res){
  res.render('admin/add-products',{admin:true})
})

router.post('/add-products',(req,res)=>{
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addproduct(req.body,(id)=>{
    console.log(id);
    let image=req.files.image
    image.mv(`./public/product-image/${id}.jpg`,(err,done)=>{
      if(!err){
        console.log("uploaded");
      }else{
        console.log(err);
      }
    })

 res.render('./admin/add-products',{admin:true})

  })
})
router.get('/userorders',async(req,res)=>{
  let details=await productHelpers.getUserDetails()

  res.render('./admin/userorders',{admin:true,details})
})
router.get('/orderRecieved/:id',async(req, res)=>{
  

 let orders= await productHelpers.getAllOrders(req.params.id)
    res.render('./admin/orderRecieved', { orders,admin:true })
  

})
router.get('/delete-product/:id',(req,res)=>{
  let proid=req.params.id
  productHelpers.deleteproduct(proid).then((response)=>{
    res.redirect('/admin/')
  })
  
})
router.get('/edit-products/:id',async(req,res)=>{
  let proid=req.params.id
  let products=await productHelpers.getprodetails(proid)
  console.log(products);

  
    res.render('admin/edit-products',{admin:true,products})

})
router.post('/edit-products/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProducts(req.params.id,req.body).then(()=>{

    if (req.files.image) {
      let image=req.files.image
      image.mv(`./public/product-image/${id}.jpg`)
      
    }
    res.redirect('/admin')

  })
})
router.post('/adminlogin',(req,res)=>{
  console.log(req.body);

  adminHelper.verifyAdmin(req.body).then((response)=>{
    
    
    if(response.status){
      req.session.user=response.user
      req.session.adminloggedin=true;
      res.redirect('/admin')
    }else{
      res.redirect('/admin/adminlogin')
    }
  })
})

  



module.exports = router;
