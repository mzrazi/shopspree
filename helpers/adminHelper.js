var collection=require('../config/collection')


module.exports={
    verifyAdmin:(data)=>{

let response={}
        return new Promise((resolve, reject) => {
            if(data.username=='admin'){
                if(data.password=='12345'){
                    response.admin="admin"
                    response.status=true
                    resolve(response)
                }else{
                    resolve({status:false})
                    console.log('wrong pass');
                }
            }else{
                resolve({status:false})
                console.log('wrong username');

            }
        })
      
    }
}

