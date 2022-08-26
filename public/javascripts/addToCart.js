const { USER_COLLECTION } = require("../../config/collections");

function addToCart(proId){
    console.log('in fun')
    $.ajax({
        url: '/addToCart/' + proId,
        
        method: 'get',
        success: (response)=>{
            alert(response);
            console.log(response)
    
        }
    })
}