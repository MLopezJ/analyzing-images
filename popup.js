const URL = "https://vision.googleapis.com/v1/images:annotate"
const API_KEY = "YOUR-API-KEY"

var callback = async function (imagesFromBrowser) {

    document.body.innerHTML = '';
    let images = []

    for (var i in imagesFromBrowser[0]) {

        var params = {
            headers : { "Content-Type" : "application/json"},
            body: JSON.stringify({
                "requests": [
                {
                    "image": {
                      "source": {
                        "imageUri": imagesFromBrowser[0][i]
                      }
                    },
            
                    "features": [
                      {
                        "type": "SAFE_SEARCH_DETECTION"
                      },
                     {
                    "maxResults": 10,
                                "type": "OBJECT_LOCALIZATION"
                     }
                    ]
                  }
                ]
            }),
            method: "POST"
        };
        
        images.push(fetch(`${URL}?key=${API_KEY}`,params)
            .then(data => {return data.json()})
            //.then(res => console.log(res))
            .catch(error => console.log(error)))
        
    }

    Promise.all(images)
    .then(imagesWithDescription => {

        var h1 = document.createElement("h1");
        var h1Text = document.createTextNode("Images in tab");
        h1.appendChild(h1Text);

        let divSuccessful = document.createElement("div");
        let divError = document.createElement("div");

        for (let image in imagesWithDescription){

            let img = document.createElement('img');
            let p = document.createElement("p");
            let divCard = document.createElement("div");
            img.src = imagesFromBrowser[0][image];
            divCard.appendChild(img)

            console.log(imagesWithDescription[image].responses[0])

            if (imagesWithDescription[image].responses[0].error){
                
                var text = document.createTextNode(`error identifying the image. Source: ${img.src}`);
                // more info -> code error
                p.appendChild(text);
                divCard.appendChild(p)
                divError.appendChild(divCard)
            }

            else{
                
                var text = document.createTextNode("Have been identified in the image: : ");
                p.appendChild(text);

                let divMoreInfo = document.createElement("div");
                let btn = document.createElement("BUTTON")
                btn.innerHTML = "+ Info"; 
                btn.className = "accordion";
                divMoreInfo.className = "panel";
                divMoreInfo.appendChild(p)
                
                if (imagesWithDescription[image].responses[0].localizedObjectAnnotations){
                    
                    let ul = document.createElement("ul");

                    for (let description in imagesWithDescription[image].responses[0].localizedObjectAnnotations){
                        
                        let porcetanje = Math.round(imagesWithDescription[image].responses[0].localizedObjectAnnotations[description].score * 100)
                        let li = document.createElement("li");
                        li.appendChild(document.createTextNode(`A ${imagesWithDescription[image].responses[0].localizedObjectAnnotations[description].name} with ${porcetanje}% of precision`));
                        ul.appendChild(li)
                        
                    }

                    divMoreInfo.appendChild(ul)
                }

                divCard.appendChild(divMoreInfo)
                divSuccessful.appendChild(divCard)
            }
            
        }

        btn = document.createElement("BUTTON")
        btn.innerHTML = "+ Info"; 
        btn.className = "accordion";
        document.body.appendChild(btn);
        let pTest = document.createElement("p");
        let textTest = document.createTextNode("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");
        let divTest = document.createElement("div");
        divTest.className = "panel";
        pTest.appendChild(textTest);
        divTest.appendChild(pTest)
        document.body.appendChild(divTest);

        var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
        


        document.body.appendChild(h1);
        document.body.appendChild(divSuccessful);
        document.body.appendChild(divError);
    })
    .catch(error => {console.log(error)})
};


chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
        code: 'Array.prototype.map.call(document.images, function (i) { return i.src; });'
    }, callback);
});