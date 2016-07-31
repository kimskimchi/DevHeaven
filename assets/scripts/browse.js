var $info = $("section#listing")

$(document).ready(function() {
    window.setTimeout(handle(),2000);
    console.log('test');
});

document.getElementById("allapps").onclick = function() {
    // console.log('111');
    // alert('here');
    $info.empty();
    $.ajax({
        url: '/getapps', //the URL to your node.js server that has data
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
                class: 'appLogo'
            });
            var $section3 = $("<section/>",{
                class: 'appDesc'
            });
            var $section4 = $("<section/>",{
                class: 'jobInfo'
            });

            var name = json[i].name;
            var company = json[i].company;
            var logo = json[i].logo;
            var summary = json[i].summary;
            var $img = $('<img/>',{
                src: logo
            });
            var app_id = json[i].id;

            $section1.append($img);
            $section2.append("<h3>" + name + "</h3>");
            $section2.append("<p>" + company+ "</p>");
            $section3.append("<br>");
            $section3.append("<p>" + summary + "</p>");
            $section4.append("<button type='submit' class='btn' id='" + app_id + "'>App Main Page</button>");
            $article.append($section1);
            $article.append($section2);
            $article.append($section3);
            $article.append($section4);

            $("section#listing").append($article);
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
        url: '/getsearchedapps', //the URL to your node.js server that has data
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
                class: 'appLogo'
            });
            var $section3 = $("<section/>",{
                class: 'appDesc'
            });
            var $section4 = $("<section/>",{
                class: 'jobInfo'
            });

            var name = json[i].name;
            var company = json[i].company;
            var logo = json[i].logo;
            var summary = json[i].summary;
            var $img = $('<img/>',{
                src: logo
            });
            var app_id = json[i].id;

            $section1.append($img);
            $section2.append("<h3>" + name + "</h3>");
            $section2.append("<p>" + company+ "</p>");
            $section3.append("<br>");
            $section3.append("<p>" + summary + "</p>");
            $section4.append("<button type='submit' class='btn' id='" + app_id + "'>App Main Page</button>");
            $article.append($section1);
            $article.append($section2);
            $article.append($section3);
            $article.append($section4);

            $("section#listing").append($article);
        }
        // alert(num);
    });
}
