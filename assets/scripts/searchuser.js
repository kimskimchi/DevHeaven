var $info = $("section#listing")

$(document).ready(function() {
    window.setTimeout(handle(),2000);
    console.log('test');
});


document.getElementById("myfriends").onclick = function() {
    // console.log('111');
    // alert('here');
    $info.empty();
    $.ajax({
        url: '/getmyfriends', //the URL to your node.js server that has data
        dataType: 'json',
        type: "POST",
        cache: false
    }).done(function(json){
        var num = json.length;

        var friends = [];

        for(var i = 0; i < num; i++){

            var username = json[i].username;

            if (friends.indexOf(username) == -1 ){

                var $article = $("<article/>",{
                    class: 'applisting'
                });       
                var $section1 = $("<section/>",{
                    class: 'appLogo'
                });
                var $section2 = $("<section/>",{
                    class: 'appNameCreator'
                });
                var $section3 = $("<section/>",{
                    class: 'appDesc'
                });
                var name = json[i].first_name + " " + json[i].last_name;
                
                var logo = json[i].picture;
                var summary = json[i].about_you;
                var $img = $('<img/>',{
                    src: logo
                })


                $section1.append($img);
                $section2.append("<h3>" + name + "</h3>");
                $section2.append("<p>" + username + "</p>");
                $section3.append("<br>");
                $section3.append("<p>" + summary + "</p>");
                $article.append($section1);
                $article.append($section2);
                $article.append($section3);


                friends.push(username);

                $("section#listing").append($article);
            }

        }
        // alert(num);
    }); 
};

// document.getElementById("appsearchbox")
//     .addEventListener("keyup", function(event) {
//     event.preventDefault();
//     if (event.keyCode == 13) {
//         console.log("!!!");
//         handle(event);
//     }
// });

function handle(e){
    console.log("!!!");
    $info.empty();
    $.ajax({
        url: '/getsearchedusers', //the URL to your node.js server that has data
        dataType: 'json',
        type: "POST",
        cache: false
    }).done(function(json){
        var num = json.length;

        for(var i = 0; i < num; i++){

            var $article = $("<article/>",{
                class: 'applisting'
            });       
            var $section1 = $("<section/>",{
                class: 'appLogo'
            });
            var $section2 = $("<section/>",{
                class: 'appNameCreator'
            });
            var $section3 = $("<section/>",{
                class: 'appDesc'
            });
            var name = json[i].first_name + " " + json[i].last_name;
            var username = json[i].username;
            var logo = json[i].picture;
            var summary = json[i].about_you;
            var $img = $('<img/>',{
                src: logo
            })

// <form class="spacer" action="" method="post">
// <input class="submit" type="submit" value="Submit" />
// </form>
            var $form = $("<form/>",{
                method: "post",
                action: "/addfriend"
            });

            var $input = $("<input/>",{
                type: "submit",
                name: "username",
                value: username
            });

            $form.append($input);
            $section1.append($img);
            $section2.append("<h3>" + name + "</h3>");
            $section2.append("<p>" + username + "</p>");
            $section3.append("<br>");
            $section3.append("<p>" + summary + "</p>");
            $article.append($section1);
            $article.append($section2);
            $article.append($section3);
            $article.append("<p>" +"Click to add friend:" + "</p>");
            $article.append($form);

            $("section#listing").append($article);
        }
        // alert(num);
    }); 
}