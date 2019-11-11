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

title = (document) => {
    var h1 = document.createElement("h1");
    var h1Text = document.createTextNode("Analizing images from browser with Google Cloud Vision API and Chrome extensions");
    h1.appendChild(h1Text);
    document.body.appendChild(h1);
}

errorRequestGoogleVisionAPI = (document) => {
    var h2 = document.createElement("h2");
    var h2Text = document.createTextNode("Put your Google Cloud Vision API in the extension script");
    h2.appendChild(h2Text);
    return h2
}

declareElements = (image, index) => {

    let img = document.createElement('img');
    let p = document.createElement("p");
    let divCard = document.createElement("div");
    img.src = image;
    divCard.appendChild(img)

    divCard.className = index % 2 == 0 ?  "even" : "odd"
    divCard.className += " divCard"

    return [divCard,img,p]

}

createDivError = (imgSrc, p, divCard, divError) => {
    var text = document.createTextNode(`error identifying the image. Source: ${imgSrc}`);
    p.appendChild(text);
    divCard.appendChild(p)
    divError.appendChild(divCard)
}

createMoreInfo = (p, image) =>{
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

    return [divMoreInfo, btn]
}

fillDivMoreInfo = (list,divMoreInfo) => {
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
    return divMoreInfo
}

deployInfoOnClick = (acc) => { 

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

}

var callback = async function (imagesFromBrowser) {

    document.body.innerHTML = '';
    let images = requestImages(imagesFromBrowser[0])
    let h2 = undefined

    Promise.all(images)
    .then(imagesWithDescription => {


        title(document)

        let divSuccessful = document.createElement("div");
        let divError = document.createElement("div");

        for (let image in imagesWithDescription){

            if (imagesWithDescription[image].responses) {

                [divCard,img,p] = declareElements(imagesFromBrowser[0][image], image)

                if (imagesWithDescription[image].responses[0].error){    
                    createDivError(img.src, p, divCard, divError)
                }

                else{
                    
                    [divMoreInfo, btn] = createMoreInfo(p, image)
                    
                    
                    list = imagesWithDescription[image].responses[0].localizedObjectAnnotations//[{mid: "/m/01g317", name: "Person", score: 0.7900113}, {mid: "/m/02dl1y", name: "Hat", score: 0.52533555}]

                    
                    //if (){ 
                    if (list){ //testing case
                        divMoreInfo = fillDivMoreInfo(list,divMoreInfo)
                    }

                    divCard.appendChild(btn);
                    divCard.appendChild(divMoreInfo)
                    divSuccessful.appendChild(divCard)
                }

            }

            else{
                h2 = errorRequestGoogleVisionAPI(document)
            }
        }

        //document.body.appendChild(h1);
        h2 ? document.body.appendChild(h2) : null
        document.body.appendChild(divSuccessful);
        document.body.appendChild(divError);

        var acc = document.getElementsByClassName("accordion");
        deployInfoOnClick(acc)
        


        
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