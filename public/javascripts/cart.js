function addToCart(proId) {
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
function removeProduct(proId) {
    $.ajax({
        url: '/remove-product/' + proId,
        method: 'get',
        success: async (response) => {
            $('#my-cart').html(response)
        }
    })
}
function incQuantity(proId, id) {

    $.ajax({
        url: '/add-to-cart/' + proId,

        method: 'get',
        success: async (response) => {

            var quantity = document.getElementById(id).value;
          
            count = parseInt(quantity) + 1
            $(id).html(count);
            document.getElementById(id).value = count;
        }
    })
}
function decQuantity(cartId, id, proId) {

    var quantity = document.getElementById(id, count).value;
    var count = parseInt(quantity)
    if (count > 1) {
        $.ajax({
            url: '/qty/' + cartId + '/' + proId,
            method: 'get',
            success: (response) => {
    
                var quantity = document.getElementById(id).value;
                count = parseInt(quantity) - 1
                $(id).html(count);
                document.getElementById(id).value = count;
            }
        })
    }
}