
$(document).ready(function () {
    $("#address_form").submit((e) => {
        e.preventDefault()
        $.ajax({
            type: "post",
            url: "/checkout-address",
            data: $('#address_form').serialize(),
            success: (response) => {
                $('#checkout').html(response)
            }
        });
    }) 


});
function purchase() {
    $.ajax({
        url: "/place-order",
        method: 'get',
        success: (response) => {
            razorpayPayment(response)
        }
    })
}

function razorpayPayment(order) {

    var options = {
        "key": "rzp_test_qjRHUAXRk6sVu8", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ShopKart",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        },
        "handler": function (response) {
         
            varifyPayment(response, order)
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function varifyPayment(order_dt, order) {
   
    $.ajax({
        type: "post",
        url: "/varify_payment",
        data: {
            order_dt,
            order
        },
        success: function (response) {
            console.log(response);
            $('#checkout').html(response)
        }
    });
}