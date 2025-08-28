// ==UserScript==
// @name         Dubloon-o-Matic-o-Matic
// @version      1
// @description  Make the Dubloon-o-Matic easier to use
// @author       Flutterz
// @match        https://www.neopets.com/pirates/dubloonomatic.phtml
// @grant        none
// ==/UserScript==

//Initialize values
let content = document.getElementsByClassName("content")[0];
const denom = [-1,1,2,5,10,20,50,100,200,500,1000];
let counts = [0,0,0,0,0,0,0,0,0,0,0];
let clicked = false;
content = content.getElementsByTagName("form")[0];
let dubloons = content.getElementsByTagName("td");
let checks = [];

//Count available dubloons and add checkboxes for easy access
for (let i = 0; i < dubloons.length-2; i++){
    let value = dubloons[i].innerHTML;
    let needle = value.indexOf(".gif");
    value = value.substring(needle-1,needle);
    counts[value]++;
    checks.push(dubloons[i].children[4]);
}

//Hide original UI
content.style.display = "none";

//Create new UI code
let menu = document.createElement('div');
let tableCode = `<center><table style="width:500px;">
    <thead>
        <tr>
            <th>Dubloon</th>
            <th>Value</th>
            <th>Owned</th>
            <th>Use</th>
        </tr>
    </thead>
    <tbody>`;
//New table row for each dubloon value
for (let i = 1; i < 11; i++){
    if (counts[i]>0){
        tableCode = tableCode + `<tr>
            <td><center><img src = "//images.neopets.com/items/dubloon`+i+`.gif"></center></td>
            <td><center><b>`+denom[i]+`</b></center></td>
            <td><center>`+counts[i]+`</center></td>
            <td><center><input type="text" class="domomText" id="domom`+i+`" style="width:50px; background-color:white;"></center></td>
    </tr>`;
    }
}
tableCode = tableCode + `</tbody>
</table><br><br>
<b>Result:</b><br><table style="width:300px;"><tr><td><center><img id="domomResultImage" src ="https://i.imgur.com/y9wOAjq.png"></center></td><td id="domomResult">0</td><td><button id="domomResultButton" "type="button" disabled>Exchange!</button></td></tr></table></center><br><br><br><br>`;
menu.innerHTML = tableCode;
content.after(menu);

//Add change events to new textboxes to tally dubloon values and check for invalid amounts
let textBox = document.getElementsByClassName("domomText");
for (let i = 0; i < textBox.length; i++){
    textBox[i].addEventListener("change", function(){
        let total = 0;
        let sel = 0;
        let err = false;
        //Iterate over the textboxes, tallying and checking for invalid values
        for (let j = 0; j < textBox.length; j++){
            let v = textBox[j].value;
            sel = sel + Number(v);
            if ((v>counts[textBox[j].id.replace("domom","")])||(isNaN(v))||(v<0)){
                err = true;
                textBox[j].style.backgroundColor="#DD1111";
            } else {
                total = total + Number(v)*denom[textBox[j].id.replace("domom","")];
                textBox[j].style.backgroundColor="#FFFFFF";
            }
        }
        //Output total and set image and button status accordingly
        document.getElementById("domomResult").innerText = total;
        let ind = denom.indexOf(total);
        if ((ind == -1)||(sel==1)||(err)){
            document.getElementById("domomResultImage").src = "https://i.imgur.com/y9wOAjq.png";
            document.getElementById("domomResultButton").disabled = true;
        } else {
            document.getElementById("domomResultImage").src = `//images.neopets.com/items/dubloon`+ind+`.gif`;
            document.getElementById("domomResultButton").disabled = false;
        }
    });
}

//Add click event to new button to select appropriate dubloons in original UI and click original UI button
document.getElementById("domomResultButton").addEventListener("click", function(){
    if (!clicked){
        //Prevent multiclicks and disable all UI interaction
        clicked = true;
        document.getElementById("domomResultButton").disabled = true;
        document.getElementById("domomResultButton").innerText = "Exchanging...";
        for (let j = 0; j < textBox.length; j++){
            textBox[j].disabled=true;
        }

        //Set exchange target
        document.getElementsByName("exch_up")[0].value=Number(document.getElementById("domomResult").innerText);

        //Select all the desired dubloons
        let total = 0;
        for (let i = 1; i < 11; i++){
            if (document.getElementById("domom"+i)!=null){
                let target = document.getElementById("domom"+i).value;
                if (target>0){
                    for (let j = 0; j < target; j++){
                        checks[total+j].checked=true;
                    }
                }
            }
            total = total + counts[i];
        }
    }

    //Click the button
    content.children[0].children[1].children[6].children[0].click();
});
