var db= require('../config/connection')

var col=require('../config/collection')
const bcrypt=require('bcrypt')
const collection = require('../config/collection')
const { Logger } = require('mongodb')
var ObjectID = require('mongodb').ObjectId
const Razorpay=require('razorpay')
const { resolve } = require('node:path')
const { response } = require('express')
var instance = new Razorpay({
    key_id: 'rzp_test_mHGtVeceRk4I0h',
    key_secret: 'IolN0Um9H87P2kNPTrSVK7Cy',
  });



module.exports={

    signupF:(Udata)=>{
        return new Promise(async(resolve, reject) => {
     Udata.password= await bcrypt.hash(Udata.password,10)
        db.get().collection(col.UCollection).insertOne(Udata).then((data)=>{
            db.get().collection(col.UCollection).findOne({_id:ObjectID(data.insertedId)}).then((response)=>{
                resolve(response)
            })
        
       
        })
   
   
    })

    },
    doLogin:(userdata)=>{

        return new Promise(async(resolve, reject) => {
            
            let response={}
            let user=await db.get().collection(col.UCollection).findOne({email:userdata.email})
            
          
            
        
           
            if (user) {
               
                hash = user.password
                bcrypt.compare(userdata.password,hash).then((status)=>{
                    
                    if (status) {
                        console.log('logged in');
                    response.user=user
                    response.status=true     
                    resolve(response)                   

                        
                    }else{
                        console.log("failed pass");
                            resolve({status:false})
                    }
                })
                
            }else{
                console.log("failed email");
                resolve({status:false})
            }

           
           
        })

    },

    addToCart:(proid,userid)=>{
        let proObj={
            item:ObjectID(proid),
            quantity:1
        }
        console.log(proid);

        return new Promise(async(resolve, reject) => {
            let cartuser=await db.get().collection(collection.CCollection).findOne({user:ObjectID(userid)})
           

            if (cartuser) {
                let proExist=cartuser.products.findIndex(product=> product.item==proid)
               
                if (proExist!=-1) {
                    
                    db.get().collection(collection.CCollection)
                    .updateOne({user:ObjectID(userid),'products.item':ObjectID(proid)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    
                    
                    
                ).then(()=>{
                   
                resolve()
                })
                }else{
                db.get().collection(collection.CCollection)
                .updateOne({user:ObjectID(userid)},
                {
                    $push:{products:proObj}
                   
                       
                },
                
                ).then((response)=>{
                    console.log(response);
                    resolve()
                })
            }
                
            }else{
                let cartobj={
                    user:ObjectID(userid),
                    products:[proObj]
                    
                }
                db.get().collection(collection.CCollection).insertOne(cartobj).then(()=>{
                    resolve()
                })
            }
        })
    },
    getCart:async(userid)=>{
       
        return new Promise(async(resolve, reject) => {
            let cartItems=await db.get().collection(collection.CCollection).aggregate([
                {
                    $match:{user:(ObjectID(userid))}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                    from:collection.PCollection,
                    localField:'item',
                    foreignField:'_id',
                    as:'pdetails'
                    }
                   
                },
                {
                    $project:{
                        item:1,quantity:1,product:{ $arrayElemAt: [ '$pdetails',0 ] }
                    }
                }
                
               
        
            ]).toArray()
           
            console.log(cartItems);
            resolve(cartItems)
           
            
        })
    },

    getCount:(uid)=>{
        return new Promise(async(resolve, reject) => {
            let count=0
            let cart=await db.get().collection(collection.CCollection).findOne({user:ObjectID(uid)})
            if (cart) {
                count=cart.products.length
            }
            resolve(count)
           
        })
    },
    changeQ:(details,length)=>{
       
        count=parseInt(details.count)
        quantity=details.quantity
       
        return new Promise((resolve, reject) => {
          
            db.get().collection(collection.CCollection)
            .updateOne({_id:ObjectID(details.cart),'products.item':ObjectID(details.product)},
            {
                $inc:{'products.$.quantity':count}
            }
            
        
            
        ).then((response)=>{
        resolve({status:true})
        })
    
        })

    },

    removeP:(details)=>{
       
        
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CCollection)
                .updateOne({_id:ObjectID(details.cart)},
                {
                    $pull:{products:{item:ObjectID(details.product)}}
                }
                
                
                ).then((response)=>{
                    resolve({productRemoved:true})
                })

        })
        
    },
    totalAm:async(userid)=>{


        return new Promise(async(resolve, reject) => {

            
            let total=await db.get().collection(collection.CCollection).aggregate([
                {
                    $match:{user:(ObjectID(userid))}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                    from:collection.PCollection,
                    localField:'item',
                    foreignField:'_id',
                    as:'pdetails'
                    }
                   
                },
                {
                    $project:{
                        item:1,quantity:1,product:{ $arrayElemAt: [ '$pdetails',0 ] }
                    }
                },
                
                {
                
                    $group:{
                        _id:null,
                        result:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
                    }
                }
                
               
        
            ]).toArray()
           
                resolve(total[0].result)
           
      
        })
    
   

    },
    getProlist:(userid)=>{
        return new Promise(async(resolve, reject) => {
           let cart=await db.get().collection(collection.CCollection).findOne({user:ObjectID(userid)})
          
           resolve(cart)
        })
    },
    placeOrder:(details,total,products)=>{
        return new Promise((resolve, reject) => {
          
            let status=details.method==='COD'?'placed':'pending'

            let orderobj={

                address:{
                    name:details.name,
                    address:details.address,
                    pincode:details.pin,
                    mob : details.mob
                },
                userId:ObjectID(details.userId),
                totalAm:total,
                products:products,
                status:status,
                paymentMethod:details.method,
                date:new Date()

            }
            db.get().collection(collection.OCollection).insertOne(orderobj).then((response)=>{
                db.get().collection(collection.CCollection).deleteOne({user:ObjectID(details.userId)})
                let id=response.insertedId
                resolve(id)
            })
            
           
            


        })
        

     


        },
        getOrder:(userid)=>{
            return new Promise(async(resolve, reject) => {
            let orders=await db.get().collection(collection.OCollection).findOne({userId:ObjectID(userid)})

            
            resolve(orders)
                })
           
        },

        getAllOrders:(userid)=>{

            return new Promise((resolve, reject) => {
                let AllOrders=db.get().collection(collection.OCollection).find({userId:ObjectID(userid)}).toArray()

                resolve(AllOrders)
                
            })
       
        },
        getOrderedP:(orderid)=>{ 
            console.log(orderid);
            return new Promise(async(resolve, reject) => {
                let orderItems=await db.get().collection(collection.OCollection).aggregate([
                    {
                        $match:{_id:(ObjectID(orderid))}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                        from:collection.PCollection,
                        localField:'item',
                        foreignField:'_id',
                        as:'pdetails'
                        }
                       
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{ $arrayElemAt: [ '$pdetails',0 ] }
                        }
                    }
                    
                   
            
                ]).toArray()
               
                console.log(orderItems);
                resolve(orderItems)
               
                
            })
        },

        generateRazor:(orderid,total)=>{

            return new Promise((resolve, reject) => {
               
               var options= {
                    amount: total*100,
                    currency: "INR",
                    receipt: ""+orderid,
                   
                    }
                    instance.orders.create(options, function(err,order){
                        if (err) {
                            console.log(err);

                        }else{

                        console.log('new order:',  order);
                        resolve(order)
                        }
                    })
                   
            })


    },
    verifyPayment:(details)=>{
       return new Promise(async(resolve, reject) => {
        const {
            createHmac
          } = await import('node:crypto');
          
          let hmac = createHmac('sha256', 'IolN0Um9H87P2kNPTrSVK7Cy');
          
          hmac.update(details['payment[razorpay_order_id]']+"|"+ details['payment[razorpay_payment_id]']);
          
          console.log(details['payment[razorpay_signature]']);
          hmac=hmac.digest('hex')
          console.log(hmac);
          if (hmac==details['payment[razorpay_signature]']) {

            console.log('matched');
            resolve()
            
          }else{
            console.log('not match');
            reject()
            
          }
       })
    },

    changeOstatus:(orderid)=>{

        return new Promise((resolve, reject) => {
            db.get().collection(collection.OCollection)
        .updateOne({_id:ObjectID(orderid)},{
        $set:{

            status:'placed'

        }
    }
        ).then(()=>
        resolve())
   
        }
        )
        
    },

    getUserDetails:(userid)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UCollection).findOne({_id:ObjectID(userid)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    }


}




    

