var $info = $("section#users")

$(document).ready(function() {
    window.setTimeout(handle(),2000);
    console.log('test');
});


function handle(e){
    console.log("!!!");
    $info.empty();
    $.ajax({
        url: '/getusers', //the URL to your node.js server that has data
        dataType: 'json',
        type: "POST",
        cache: false
    }).done(function(json){
        var num = json.length;

        for(var i = 0; i < num; i++){
   
            var $article = $("<article/>",{
                class: 'applisting'
            });  
            var $section3 = $("<section/>",{
                class: 'appDesc'
            });
            var id = json[i].id;
            var name = json[i].username;
            var email = json[i].email;
            var first_name = json[i].first_name;
            var last_name = json[i].last_name;
            var birthday = json[i].birthday;
            var address = json[i].address;
            var education = json[i].education;
            var gender = json[i].gender;
            var about_you = json[i].about_you;

            $section3.append("<p>" + " id: "+id + " name: "+name + " email: "+email
            + " first_name: "+first_name + " last_name: "+last_name + " birthday: "+birthday
            + " address: "+address + " education: "+education + " gender: "+gender
            + " about_you: "+about_you + "</p>");
            $article.append($section3);

            $("section#users").append($article);
        }
        // alert(num);
    }); 
}