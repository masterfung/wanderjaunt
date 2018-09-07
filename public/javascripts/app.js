$(function(){

    $("#fetchInventory").on('click', function(){
        $.get( "/api/v1/fetchInventory", function( data ) {
            let inventories = data['data'];
            $("#trdata").html('');
            $("#message").hide();
            let string = '';
            $.each(inventories, function(index, inventory ) {

                string += '<tr><td>'+(index+1)+'</td><td>'+inventory['_id']+'</td><td>'+inventory['category']+'</td><td>'+inventory['subCategory']+'</td><td>'+inventory['budget']+'</td><td>'+inventory['name']+'</td>' +'</td><td>'+inventory['description']+'</td>'+'<td>'+inventory['brand']+'</td>' +'<td>'+inventory['unitCost']+'</td>' + '<td>'+inventory['quantity']+'</td>' + '</tr>';
            });

            $("#trdata").html(string);
        });
    });

    $("#importData").on('click', function(){
        $.get( "/api/v1/importInventories", function( data ) {
            $("#message").show().html(data['success']);
        });
    });

});
