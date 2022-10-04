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
function incQuantity(proId, id, price) {

    $.ajax({
        url: '/add-to-cart/' + proId,

        method: 'get',
        success: async (response) => {

            var quantity = document.getElementById(id).value;
          
            count = parseInt(quantity) + 1
            document.getElementById(id).value = count;
            const elements = document.querySelectorAll('.total-price');

            elements.forEach(el => {
              el.textContent = parseFloat(el.textContent) + parseFloat(price);
            });
        }
    })
}
function decQuantity(cartId, id, proId, price) {

    var quantity = document.getElementById(id, count).value;
    var count = parseInt(quantity)
    if (count > 1) {
        $.ajax({
            url: '/qty/' + cartId + '/' + proId,
            method: 'get',
            success: (response) => {
    
                var quantity = document.getElementById(id).value;
                count = parseInt(quantity) - 1;
                document.getElementById(id).value = count;

                var totalPrice = 0.0
                var totalPrice = document.getElementById("total-price").innerHTML;
                const elements = document.querySelectorAll('.total-price');
    
                elements.forEach(el => {
                    el.textContent = parseFloat(el.textContent) - parseFloat(price);
                });
            }
        })
    }
}