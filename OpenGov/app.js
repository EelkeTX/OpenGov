setTimeout(function () {        //see below for explanation
    new Vue({
        el: '#app',
        data: {
            searchQuery: null,
            apiKey: 'cHWA0cyVrIeIZHFmZyrlp3UBNFO1aqLn7LsYLij2',
            urlFirst: "https://api.propublica.org/congress/v1/116/",
            urlLast: "/members.json",
            isNinja: true,    //used for the show more/less in index
            selectedState: "all",
            tableShown: false, //used to hide tables until their data is populated
            checkedParties: ["Democrat", "Republican", "Independent"],
            table1: [],         //main table data to manipulate
            table2: [],
            demNum: 0,
            demAvgPerc: 0,          //calculating data for the at a glance tables
            repNum: 0,
            repAvgPerc: 0,
            indNum: 0,
            indAvgPerc: 0,
            attendance: [],             //sorting for specific pages
            loyalty: [],
            currentSortMain: 'last_name',
            currentSortAlt: 'last_name',
            currentSortAltAlt: 'last_name',  //needed a 3rd table, dont ask
            currentSortDirMain: 'asc',
            currentSortDirAlt: 'asc',
            currentSortDirAltAlt: 'asc',
        },
        mounted() {     //using this to look which page is loaded, then start the right method with the correct parameters
            let fileName = location.href.split("/").slice(-1);
            if (fileName[0] === "index.html"){
                let showTable = this.tableShown = true;
                setTimeout(showTable, 100);         //fancy slide fade hype
            }
            if (fileName[0] === "116senate.html"){
                this.getMembers('senate');
            }
            if (fileName[0] === "116house.html"){
                this.getMembers('house');
            }
            if (fileName[0] === "attsenate.html"){
                this.getAttendance('senate', 'attendance');
            }
            if (fileName[0] === "atthouse.html"){
                this.getAttendance('house', 'attendance');
            }
            if (fileName[0] === "loysenate.html"){
                this.getAttendance('senate', 'loyalty');
            }
            if (fileName[0] === "loyhouse.html"){
                this.getAttendance('house', 'loyalty');
            }
        },
        computed: {
            filteredParties() {         // filters table1 to only show those whose parties have checkmarks active
                return this.table1.filter(members => this.checkedParties.includes(members.partyStr))
            },
            filteredStates() {          // loops the checkmark filter into the state select filter, only showing the selected states
                if (this.selectedState === "all") {     //of those whose party checkbox is also selected
                    return this.filteredParties;
                } else {
                    return this.filteredParties.filter(members => this.selectedState.includes(members.state))
                }
            },
            resultQuery() {                 //filter out the results that dont have stuff typed in the search bar
                if (this.searchQuery) {
                    return this.filteredStates.filter((item) => {
                        return this.searchQuery.toLowerCase().split(' ').every(q => item.fullName.toLowerCase().includes(q))
                    })
                } else {
                    return this.filteredStates;
                }
            },
            sortedMain: function () {       //makes sure our sortMain function has a settable direction and key
                return this.resultQuery.sort((a, b) => {
                    let modifier = 1;
                    if (this.currentSortDirMain === 'desc') modifier = -1;
                    if (a[this.currentSortMain] < b[this.currentSortMain]) return -1 * modifier;
                    if (a[this.currentSortMain] > b[this.currentSortMain]) return 1 * modifier;
                    return 0;
                });
            },
            sorted_attendance() {           //sorts the attendance(secretly the main array renamed) by missed votes, for slicing
                return this.attendance.sort((a, b) => { return b.missed_votes - a.missed_votes; });
            },
            sorted_loyalty() {              //sorts by party vote percentage for the loyalty tables
                return this.loyalty.sort((a, b) => { return b.votes_with_party_pct - a.votes_with_party_pct; });
            },
            sortedAlt: function () {        //sort function that doesnt loop through the filters, used in attendance and loyalty pages
                return this.table1.sort((a, b) => {
                    let modifier = 1;
                    if (this.currentSortDirAlt === 'desc') modifier = -1;
                    if (a[this.currentSortAlt] < b[this.currentSortAlt]) return -1 * modifier;
                    if (a[this.currentSortAlt] > b[this.currentSortAlt]) return 1 * modifier;
                    return 0;
                });
            },
            sortedAltAlt: function () {     // second sort function that doesnt loop through the filters, used in attendance and loyalty pages
                return this.table2.sort((a, b) => {     //makes sure tables have their own separate sorting options and directions
                    let modifier = 1;
                    if (this.currentSortDirAltAlt === 'desc') modifier = -1;
                    if (a[this.currentSortAltAlt] < b[this.currentSortAltAlt]) return -1 * modifier;
                    if (a[this.currentSortAltAlt] > b[this.currentSortAltAlt]) return 1 * modifier;
                    return 0;
                });
            },
            totalMembers: function() {      //calculating for the at a glance table, self explanatory
                return this.demNum + this.repNum + this.indNum
            },
            totalAvgWithParty: function() {     //taking the average of 3 averages to average an average average.
                return ((Number(this.demAvgPerc) + Number(this.repAvgPerc) + Number(this.indAvgPerc))/3).toFixed(2);
            }
        },
        methods: {
            async getMembers(housenate) {
                let responseArr = [];
                let getUrl = this.urlFirst + housenate + this.urlLast;
                responseArr = await fetch(getUrl, { headers: { "X-Api-Key": this.apiKey } });  //getting the json data from our selected house/senate
                return responseArr.json()
                    .then((myJson) => {
                        let everyone = myJson.results[0].members;  // turning the json response in a table i can use
                        this.table1 = everyone.filter(function (obj, index) {
                            return obj.in_office === true;  //filtering out inactives or people that have since switched sides 
                        }, this)
                        for (let i = 0; i < this.table1.length; i++) {
                            if (this.table1[i].party === "D") {     //changing party letters to full words
                                this.table1[i].partyStr = "Democrat";   //also using these labels to check if they should pass the party filter or not
                            } else if (this.table1[i].party === "R") {
                                this.table1[i].partyStr = "Republican";
                            } else if (this.table1[i].party === "I" || this.table1[i].party === "ID") { //why dont they have thesame party tags?
                                this.table1[i].partyStr = "Independent";
                            }
                            let senString = this.table1[i].seniority.toString();  //adding a 0 if seniority is only 1 digit, for sorting purposes
                            if (senString.length == 1) {                            // not actually showing it, just sorting by it
                                this.table1[i].senSeniority = "0" + senString;
                            } else {
                                this.table1[i].senSeniority = this.table1[i].seniority;
                            }
                            this.table1[i].fullName = this.table1[i].last_name + ', ' + this.table1[i].first_name; //full names for search bar
                            this.table1[i].voteWithRound = Number(this.table1[i].votes_with_party_pct).toPrecision(4); //wanted 2 decimals
                        }
                        this.tableShown = true; //after everything is done, show the data!
                    })
            },
            async getAttendance(housenate, attenalty) {
                let responseArr = [];
                let getUrl = this.urlFirst + housenate + this.urlLast;
                responseArr = await fetch(getUrl, { headers: { "X-Api-Key": this.apiKey } }); //like above, get json stuff
                return responseArr.json()
                    .then((myJson) => {
                        let prefilter = myJson.results[0].members //like above, making it into a table i can use and filterer out the inactives
                        let everyone = prefilter.filter(function (obj, index) {
                            return obj.in_office === true;
                        }, this)
                        this.attendance = everyone;
                        this.loyalty = everyone; // not sure i needed these copied, but it happened this way
                                                // making separate arrays for sorting
                        let demArr = everyone.filter(function (obj, index) {
                            return obj.party === "D";  //making arrays per party for calculation ease
                        }, this)
                        let demAvgSum = 0;   // iterating through party array to calculate average percentages
                        for (let i = 0; i < demArr.length; i++) {
                            demAvgSum += demArr[i].votes_with_party_pct; //adding vote percentages together to calculate averages
                        }
                        this.demAvgPerc = (demAvgSum / demArr.length).toFixed(2); //calculating averages here
                        this.demNum = demArr.length; //ez party size

                        let repArr = everyone.filter(function (obj, index) { //same for republicans
                            return obj.party === "R";
                        }, this)
                        let repAvgSum = 0;  //republicants
                        for (let i = 0; i < repArr.length; i++) {
                            if (!repArr[i].votes_with_party_pct) {
                                repArr[i].votes_with_party_pct = 0;
                            }
                            repAvgSum += repArr[i].votes_with_party_pct;
                        }
                        this.repAvgPerc = (repAvgSum / (repArr.length - 1)).toFixed(2);
                        this.repNum = repArr.length;

                        let indAArr = everyone.filter(function (obj, index) {   //for some reason these are I in the house and ID in the senate
                            return obj.party === "I";                           //filtering for both and joining the arrays later
                        }, this)
                        let indBArr = everyone.filter(function (obj, index) {
                            return obj.party === "ID";
                        }, this)
                        let tmpArr = [];
                        let indArr = tmpArr.concat(indAArr, indBArr)    // its not the most efficient, but it works wonderfully
                        let indAvgSum = 0;
                        for (let i = 0; i < indArr.length; i++) {
                            indAvgSum += indArr[i].votes_with_party_pct;
                        }
                        this.indAvgPerc = (indAvgSum / indArr.length).toFixed(2);
                        this.indNum = indArr.length;



                        if (attenalty === "attendance") {       //added a switch parameter to reuse thesame data above for multiple tables
                            let percslice = Math.round((this.sorted_attendance.length / 10));  //that still need different calulations depending
                            this.table1 = this.sorted_attendance.slice(0, percslice);   // on page
                            this.table2 = this.sorted_attendance.reverse().slice(0, percslice);     //calling the sort and taking the top 10%
                        }                                                                           //then reversing so i get the bottom 10%
                        if (attenalty === "loyalty") {
                            let loyslice = Math.round((this.sorted_loyalty.length / 10));
                            this.table2 = this.sorted_loyalty.slice(0, loyslice);                   //similar thing here sorted on a different key
                            this.table1 = this.sorted_loyalty.reverse().slice(0, loyslice);         //reverse and slice

                            for (let r = 0; r < this.sorted_loyalty.length; r++) {
                                if (!this.sorted_loyalty[r].total_votes) {
                                    this.sorted_loyalty[r].total_votes = 0;     //calculating total votes with party by taking the percentage
                                }                                               //dividing it by 100 and multiplying it by total votes
                                let pctmodifier = Number(this.sorted_loyalty[r].votes_with_party_pct / 100)
                                this.sorted_loyalty[r].party_votes = Math.round(pctmodifier * this.sorted_loyalty[r].total_votes);
                            }
                        }
                        this.tableShown = true;     //tadaa when ready
                    })
            },
            sortMain(s) {
                //if s == current sort, reverse
                if (s === this.currentSortMain) {           //main sort that loops through filters for the big tables
                    this.currentSortDirMain = this.currentSortDirMain === 'asc' ? 'desc' : 'asc';
                }
                this.currentSortMain = s;
            },
            sortAlt(s) {
                //if s == current sort, reverse
                if (s === this.currentSortAlt) {            //specified sort used for the first table on the 2 table page
                    this.currentSortDirAlt = this.currentSortDirAlt === 'asc' ? 'desc' : 'asc';
                }
                this.currentSortAlt = s;
            },
            sortAltAlt(s) {
                //if s == current sort, reverse
                if (s === this.currentSortAltAlt) {         //specified sort used for the second table on the 2 table page
                    this.currentSortDirAltAlt = this.currentSortDirAltAlt === 'asc' ? 'desc' : 'asc';
                }
                this.currentSortAltAlt = s;
            },
        },
    })
}, 100);        //i noticed the read more stuff on index was expanded for a few ms before vue loads, this fixes that.