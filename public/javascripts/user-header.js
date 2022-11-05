function productSearch(search){
    search = search.trim();
   
    $.ajax({
    type: "post",
    url: "/search-products",
    data: {
        search
    },
    success: function (response) {
       
        $("#searchResult").html(response)
    }
   
});    
}

$("#search").click(()=>{
    $(".sqwv_4").css("display","block")
})

$(document.body).click(function(e){
    if(e.target.id !== 'search')
        $(".sqwv_4").css("display","none")
});