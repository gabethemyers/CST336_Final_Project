
document.querySelector("#findItemButton").addEventListener("click",fetchProducts);

async function fetchProducts() {
    document.querySelector("#items").innerHTML = "";
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        let keyword = document.querySelector("#findItem").value;
        console.log(keyword);
        

        
        for(let key in data){
            // for(let keyword in keywords){

                if(data[key]["title"].includes(keyword) || data[key]["description"].includes(keyword)){
                    console.log("Found Match!");
                    newItem = document.createElement('span');
                    newImage = document.createElement("img");
                    newImage.setAttribute("src", data[key]["image"])
                    newImage.setAttribute("width", "100px");
                    newImage.setAttribute("height", "100px");

                    newItem.setAttribute("dataKey", key);
                    
                    newItem.setAttribute("class", "element");
                    newItem.setAttribute("dataName", data[key]["title"]);
                    newItem.setAttribute("dataImage", data[key]["image"]);
                    newItem.setAttribute("dataPrice", data[key]["price"]);
                    
                    newItem.textContent = (data[key]["title"] + " + $" + data[key]["price"]);
                    newItem.appendChild(document.createElement("br"));
                    newItem.appendChild(newImage);
                    
                    newButton = document.createElement("button");
                    newButton.textContent = "AutoFill";
                    newButton.setAttribute("dataKey", key);
                    newButton.setAttribute("dataName", data[key]["title"]);
                    newButton.setAttribute("dataImage", data[key]["image"]);
                    newButton.setAttribute("dataPrice", data[key]["price"]);
                    newButton.addEventListener("click", function(event){
                        console.log(event.target);
                        console.log("Autofilled!");
                        
                        
                        document.querySelector("#itemName").value = event.target.getAttribute("dataname");
                        document.querySelector("#itemPrice").value = event.target.getAttribute("dataprice");
                        document.querySelector("#itemImage").value = event.target.getAttribute("dataimage");
                        document.querySelector("#itemLink").value = event.target.getAttribute("datalink");
                    });
                    newItem.appendChild(document.createElement("br"));
                    newItem.appendChild(newButton);
                    document.querySelector("#items").appendChild(newItem);
                    document.querySelector("#items").appendChild(document.createElement("hr"));
                    // break;
                // 
            }
        }

        console.log(data); 
    } catch (error) {
        console.log('Error:', error);
    }
}