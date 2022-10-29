
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
