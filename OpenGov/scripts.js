let responseArr = [];
const getMembers = async(housenate) => {
    getUrl = "https://api.propublica.org/congress/v1/116/" + housenate + "/members.json"
    responseArr = await fetch(getUrl,{headers: {"X-Api-Key": "cHWA0cyVrIeIZHFmZyrlp3UBNFO1aqLn7LsYLij2"}});
    return responseArr.json()
        .then((myJson) => {
            selState = document.querySelector('#selState').value;
            let repArr = [];
            let demArr = [];
            let indArr = [];
            let indSArr = [];
            let filteredArr = [];
            let resMembers = myJson.results[0].members;
            if (selState){              //checks if state is selected, if not does nothing
                resMembers = resMembers.filter(function(obj, index){
                return obj.state===selState;
                })
            }                           //checks for democrat checkmark, if true makes an array of democrats
            if (document.querySelector('#demBox').checked){
                demArr = resMembers.filter(function(obj, index){
                    return obj.party==="D";
                })
            }                           //checks for republican checkmark, if true makes an array of republicans
            if (document.querySelector('#repBox').checked){
                repArr = resMembers.filter(function(obj, index){
                    return obj.party==='R';
                })
            }                           //checks for independant checkmark, if true makes an array of independants, ITS JUST ONE!
            if (document.querySelector('#indBox').checked){
                indArr = resMembers.filter(function(obj, index){
                    return obj.party==='I' ||obj.party==='ID';
                })
            }
                          //rejoins party arrays
            filteredArr = filteredArr.concat(demArr,repArr,indArr,indSArr);
            let row = '';               //start building the table rows
            let senSeniority = '';
            let partyStr = '';
            for (let i = 0; i < filteredArr.length; i++) {      //changing party letters to full words
                if(filteredArr[i].party==="D"){
                    partyStr = "Democrat";
                } else if(filteredArr[i].party==="R"){
                    partyStr = "Republican";
                } else {
                    partyStr = "Independant";
                }
                let senString = filteredArr[i].seniority.toString();  //adding a 0 if seniority is only 1 digit, for search purposes
                if (senString.length == 1) {
                    senSeniority = "0" + senString;
                } else {
                    senSeniority = filteredArr[i].seniority;
                }   //actually generating a row per member
            row += "<tr><td><a href='" + filteredArr[i].url + "'>" + filteredArr[i].last_name + ', ' + filteredArr[i].first_name + "</a></td><td>" + partyStr + "</td><td>" + filteredArr[i].state +"</td><td>" + senSeniority + " Years</td><td>" + Number(filteredArr[i].votes_with_party_pct).toPrecision(4) +" %</td></tr>";    
        } 
        const tableHead = "<tr><th>Senator</th><th>Party</th><th>State</th><th>Seniority</th><th>Party Votes</th></tr>" //setting table headers
        document.getElementById("members116").innerHTML = tableHead + row;
        sorttable.makeSortable(document.getElementById("members116"));
    })
};
$(".readMoreButton").on('click',() => {
    $('.aboutSecond').show();
    $('.readMoreButton').hide();
});
$(".readLessButton").on('click',() => {
    $('.aboutSecond').hide();
    $('.readMoreButton').show();
}); 
$(".responseHouseButton").on('click',() => {
    getMembers("house");
}); 
$(".responseSenateButton").on('click',() => {
    getMembers("senate");
});
$(".responseVueSenateButton").on('click',() => {
    app.getVueMembers("senate");
});
const searchTable = () => {
    // declare variables to make the function smoller
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("tableSearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("members116");
    tr = table.getElementsByTagName("tr");
 
   // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
      }
    }
}
