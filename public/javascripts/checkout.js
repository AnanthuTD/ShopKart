
$(document).ready(function () {
    $("#address_form").submit((e) => {
        e.preventDefault()
        $.ajax({
            type: "post",
            url: "/checkout-address",
            data: $('#address_form').serialize(),
            dataType: "json",
            success: (response) => {
                alert(response)
            }
        });
    })

    // $("#purchase").click(()=>{
    //     $.ajax({
    //         type: "get",
    //         url: "/place-order",
    //         data: "",
            
    //         success: function (response) {
                
    //         }
    //     });
    // })
})