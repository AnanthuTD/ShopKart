
function addToCart(proId) {
    console.log('in fun')
    $.ajax({
        url: '/add-to-cart/' + proId,

        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $('#cart-count').html(count);
            }
            loadCart()


        }
    })
}
function loadCart() {
    console.log('hello');
    window.open('/cart')
}
function removeProduct(proId){
    $.ajax({
        url: '/remove-product/'+proId,
        method: 'get',
        success: async(response)=>{
            // alert(response)
            // var count = await $('#cart-count').html()
            // console.log(count);
            // count = await parseInt(count) - 1
            // console.log(count);
            // $('#cart-count').html(10);

            $('#my-cart').html(response)
        }
    })
}