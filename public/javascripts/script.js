
console.log("hi");
$(document).ready(function () {
    $(".el, .tv, .men, .women, .kids, .sports, .home").hover(function () {
        $(".catagory_dropdown").css({ "display": "block" })
    },
        function () {
            $(".catagory_dropdown").css({ "display": "none" })
        })


}
)
