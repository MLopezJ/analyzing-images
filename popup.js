const URL = "https://vision.googleapis.com/v1/images:annotate"
const API_KEY = "YOUR-API-KEY"

requestImages = (imagesFromBrowser) => {
    let images = []

    for (var i in imagesFromBrowser) {
        
        var params = {
            headers : { "Content-Type" : "application/json"},
            body: JSON.stringify({
                "requests": [
                {
                    "image": {
                      "source": {
                        "imageUri": imagesFromBrowser[i]
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

    return images
}

var callback = async function (imagesFromBrowser) {

    document.body.innerHTML = '';
    let images = requestImages(imagesFromBrowser[0])

    Promise.all(images)
    .then(imagesWithDescription => {

        var h1 = document.createElement("h1");
        var h1Text = document.createTextNode("Analizing images from browser with Google Cloud Vision API and Chrome extensions");
        h1.appendChild(h1Text);

        let divSuccessful = document.createElement("div");
        let divError = document.createElement("div");

        for (let image in imagesWithDescription){

            //if (imagesWithDescription[image].responses) {
            if (true) { //testing case
                let img = document.createElement('img');
                let p = document.createElement("p");
                let divCard = document.createElement("div");
                img.src = imagesFromBrowser[0][image];
                divCard.appendChild(img)

                divCard.className = image % 2 == 0 ?  "even" : "odd"
                console.log(divCard.className)
                divCard.className += " divCard"

                //if (imagesWithDescription[image].responses[0].error){
                if (false){    
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
                    btn.className += image % 2 == 0 ?  " even" : " odd"
                    id = 'btn'+image
                    btn.setAttribute('id', id)
                    divMoreInfo.className = "panel";
                    divMoreInfo.appendChild(p)
                    
                    list = [{mid: "/m/01g317", name: "Person", score: 0.7900113}, {mid: "/m/02dl1y", name: "Hat", score: 0.52533555}]

                    //if (imagesWithDescription[image].responses[0].localizedObjectAnnotations){ 
                    if (list){ //testing case
                        
                        let ul = document.createElement("ul");

                        //console.log(imagesWithDescription[image].responses[0].localizedObjectAnnotations)
                        
                        //for (let description in imagesWithDescription[image].responses[0].localizedObjectAnnotations){
                        for (let description in list){ //testing case
                            
                            let porcetanje = Math.round(list[description].score * 100) //imagesWithDescription[image].responses[0].localizedObjectAnnotations
                            let li = document.createElement("li");
                            li.appendChild(document.createTextNode(`A ${list[description].name} with ${porcetanje}% of precision`)); //imagesWithDescription[image].responses[0].localizedObjectAnnotations
                            ul.appendChild(li)
                            
                        }

                        divMoreInfo.appendChild(ul)
                    }
                    divCard.appendChild(btn);
                    divCard.appendChild(divMoreInfo)
                    divSuccessful.appendChild(divCard)
                }

            }

            else{
                var h2 = document.createElement("h2");
                var h2Text = document.createTextNode("Put your Google Cloud Vision API in the extension script");
                h2.appendChild(h2Text);
            }
        }

        document.body.appendChild(h1);
        h2 ? document.body.appendChild(h2) : null
        document.body.appendChild(divSuccessful);
        document.body.appendChild(divError);

        var acc = document.getElementsByClassName("accordion");
        
        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                    this.innerHTML = "+ Info"
                } 
                else { 
                    panel.style.display = "block";
                    this.innerHTML = "- Info"
                }
            });
        }


        
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