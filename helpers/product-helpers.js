var db=require('../config/connection')

var col=require('../config/collection')
const collection = require('../config/collection')
var objectid = require('mongodb').ObjectId

module.exports= {
  
                addproduct:(product,callback)=>{

                    db.get().collection('product').insertOne(product).then((data)=>{
                        
                        
                        
                       
                        callback(product._id)
                    })
                },
                viewproducts:()=>{
                    return new Promise(async (resolve, reject) => {
                        let product = await db.get().collection(col.PCollection).find().toArray()
                        
                        resolve(product)
                    })
                },
                deleteproduct:(proid)=>{
                    return new Promise((resolve, reject) => {
                        
                    db.get().collection(collection.PCollection).deleteOne({_id:objectid(proid)}).then((response)=>
                {
                    
                    resolve(response)
                })
                    })
                
                },
                getprodetails:(proid)=>{
                    return new Promise((resolve, reject) => {
                        
                   
                    db.get().collection(collection.PCollection).findOne(_id=objectid(proid)).then((product)=>{
                        console.log(product);
                        resolve(product)
                    })
                    })
                },
                updateProducts:(proid,products)=>{
                    return new Promise((resolve, reject) => {
                        db.get().collection(collection.PCollection).updateOne({_id:objectid(proid)},{
                            $set:{
                                name:products.name,
                                price:products.price,
                                description:products.description
                            }
                        }).then((response)=>{                        resolve()
                        })
                    })
                    
                },
                getAllOrders:(userid)=>{

                    return new Promise(async(resolve, reject) => {
                        let AllOrders= await db.get().collection(collection.OCollection).find({userId:objectid(userid)}).toArray()
        
                        console.log(AllOrders);
                        resolve(AllOrders)
                        
                    })
              
            },
             getUserDetails:()=>{
                return new Promise(async(resolve, reject) => {
                   details=await db.get().collection(collection.UCollection).find({}).toArray()
                      
                       resolve(details)
                      
                    })
                }
            
        }
          