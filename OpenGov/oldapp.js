setTimeout(function() {
    new Vue({
        el: '#app',
        data: {
            message: 'Vue is loaded',
            searchQuery: null,
            apiKey: 'cHWA0cyVrIeIZHFmZyrlp3UBNFO1aqLn7LsYLij2',
            urlFirst: "https://api.propublica.org/congress/v1/116/",
            urlLast: "/members.json",
            checkedDem:[true],
            demArr:[],
            demAvgSum: 0,
            demAvgPerc: 0,
            demNum: 0,
            checkedRep:[true],
            repArr:[],
            repAvgSum: 0,
            repAvgPerc: 0,
            repNum: 0,
            indNum: 0,
            indAvgPerc: 0,
            indAvgSum: 0,
            checkedInd:[true],
            indAArr:[],
            indBArr:[],
            indArr:[],
            resMembers:[],
            missedPercMembers:[],
            filteredMembers: [],
            att1:[],
            att2:[],
            loy1:[],
            loy2:[],
            currentSort: 'last_name',
            currentSort2: 'missed_votes_pct',
            currentSort3: 'votes_with_party_pct',
            currentSort4: 'votes_with_party_pct',
            currentSort5: 'missed_votes_pct',
            currentSort6: 'missed_votes_pct',
            currentSortDir: 'asc',
            currentSortDir2: 'asc',
            currentSortDir3: 'asc',
            currentSortDir4: 'asc',
            currentSortDir5: 'asc',
            currentSortDir6: 'asc',
            selectedState: "",
            isNinja: true,
            tableShown: false
        },
        computed: {
            sortedMembers:function() {
                return this.filteredMembers.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir === 'desc') modifier = -1;
                  if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
                  if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
                  return 0;
                });
            },
            sortedAtt1:function() {
                return this.att1.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir5 === 'desc') modifier = -1;
                  if(a[this.currentSort5] > b[this.currentSort5]) return -1 * modifier;
                  if(a[this.currentSort5] < b[this.currentSort5]) return 1 * modifier;
                  return 0;
                });
            },
            sortedLoy1:function() {
                return this.loy1.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir3 === 'desc') modifier = -1;
                  if(a[this.currentSort3] < b[this.currentSort3]) return -1 * modifier;
                  if(a[this.currentSort3] > b[this.currentSort3]) return 1 * modifier;
                  return 0;
                });
            },
            sortedLoy2:function() {
                return this.loy2.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir4 === 'desc') modifier = -1;
                  if(a[this.currentSort4] > b[this.currentSort4]) return -1 * modifier;
                  if(a[this.currentSort4] < b[this.currentSort4]) return 1 * modifier;
                  return 0;
                });
            },
            sortedAtt2:function() {
                return this.att2.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir6 === 'desc') modifier = -1;
                  if(a[this.currentSort6] < b[this.currentSort6]) return -1 * modifier;
                  if(a[this.currentSort6] > b[this.currentSort6]) return 1 * modifier;
                  return 0;
                });
            },
            sortedAttendance2:function() {
                return this.missedPercMembers.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir === 'desc') modifier = -1;
                  if(a[this.currentSort2] > b[this.currentSort2]) return -1 * modifier;
                  if(a[this.currentSort2] < b[this.currentSort2]) return 1 * modifier;
                  return 0;
                });
            },
            sortedLoyalty:function() {
                return this.missedPercMembers.sort((a,b) => {
                  let modifier = 1;
                  if(this.currentSortDir4 === 'desc') modifier = -1;
                  if(a[this.currentSort4] > b[this.currentSort4]) return -1 * modifier;
                  if(a[this.currentSort4] < b[this.currentSort4]) return 1 * modifier;
                  return 0;
                });
            },
            resultQuery(){
                if(this.searchQuery){
                return this.sortedMembers.filter((item)=>{
                  return this.searchQuery.toLowerCase().split(' ').every(v => item.fullName.toLowerCase().includes(v))
                })
                }else{
                  return this.sortedMembers;
                }
            }
        },
        methods: {
            async getMembers (housenate){
                let responseArr = [];
                let getUrl = this.urlFirst + housenate + this.urlLast;
                responseArr = await fetch(getUrl,{headers: {"X-Api-Key": this.apiKey}});
                return responseArr.json()
                .then((myJson) => {
                    this.demArr = [];
                    this.repArr = []; //clear all earlier arrays
                    this.indArr = [];
                    this.indSArr = [];
//                    //let allMembers = myJson.results[0].members; test array 
                    let everyone = myJson.results[0].members;
                    this.resMembers = everyone.filter(function(obj, index){
                        return obj.in_office===true;
                    }, this)
                    if (this.selectedState){              //checks if state is selected, if not does nothing
                        this.resMembers = this.resMembers.filter(function(obj, index){
                            return obj.state===this.selectedState;
                        }, this)
                    }                    //checks for democrat checkmark, if true makes an array of democrats
                    if (this.checkedDem[0]){
                        this.demArr = this.resMembers.filter(function(obj, index){
                            return obj.party==="D";
                        }, this)
                    }                           //checks for republican checkmark, if true makes an array of republicans
                    if (this.checkedRep[0]){
                        this.repArr = this.resMembers.filter(function(obj, index){
                            return obj.party==="R";
                        }, this)
                    }                           //checks for independant checkmark, if true makes an array of independants, ITS JUST ONE!
                    if (this.checkedInd[0]){
                        this.indAArr = this.resMembers.filter(function(obj, index){
                            return obj.party==="I";
                        }, this)
                    }
                    if (this.checkedInd[0]){
                        this.indBArr = this.resMembers.filter(function(obj, index){
                            return obj.party==="ID";
                        }, this)
                    }                               //rejoins party arrays after clearing out the data array
                    this.indArr = this.indArr.concat(this.indAArr,this.indBArr)
                    this.filteredMembers = [];
                    this.filteredMembers = this.filteredMembers.concat(this.demArr,this.repArr,this.indArr,this.indSArr);
                    for (let i = 0; i < this.filteredMembers.length; i++) { 
                        if(this.filteredMembers[i].party==="D"){     //changing party letters to full words
                            this.filteredMembers[i].partyStr = "Democrat";
                        } else if(this.filteredMembers[i].party==="R"){
                            this.filteredMembers[i].partyStr = "Republican";
                        } else if(this.filteredMembers[i].party==="I" || this.filteredMembers[i].party==="ID") {
                            this.filteredMembers[i].partyStr = "Independant";
                        } 
                        let senString = this.filteredMembers[i].seniority.toString();  //adding a 0 if seniority is only 1 digit, for search purposes
                        if (senString.length == 1) {
                            this.filteredMembers[i].senSeniority = "0" + senString;
                        } else {
                            this.filteredMembers[i].senSeniority = this.filteredMembers[i].seniority;
                        }
                        this.filteredMembers[i].fullName = this.filteredMembers[i].last_name + ', ' + this.filteredMembers[i].first_name;
                        this.filteredMembers[i].voteWithRound = Number(this.filteredMembers[i].votes_with_party_pct).toPrecision(4);
                        this.tableShown = true;
                    }
                })
            },
            async getAttendance (housenate){
                let responseArr = [];
                let getUrl = this.urlFirst + housenate + this.urlLast;
                responseArr = await fetch(getUrl,{headers: {"X-Api-Key": this.apiKey}});
                return responseArr.json()
                .then((myJson) => {
                    let everyone = myJson.results[0].members;
                    let membersInOffice = everyone.filter(function(obj, index){
                        return obj.in_office===true;
                    }, this)
                    this.resMembers = membersInOffice;
                    this.missedPercMembers = membersInOffice;
                    this.loyalPercMembers = membersInOffice;
                    demArr = [];
                    repArr = [];
                    indAAarr = [];
                    indBArr = [];
                    indArr = [];
                    tmpArr = [];
                    this.demArr = this.resMembers.filter(function(obj, index){
                        return obj.party==="D";
                    }, this)
                    this.repArr = this.resMembers.filter(function(obj, index){
                        return obj.party==="R";
                    }, this)
                    this.indAArr = this.resMembers.filter(function(obj, index){
                        return obj.party==="I";
                    }, this)
                    this.indBArr = this.resMembers.filter(function(obj, index){
                        return obj.party==="ID";
                    }, this)
                    this.indArr = tmpArr.concat(this.indAArr,this.indBArr)

                    this.demAvgSum = 0;
                    for (let i = 0; i < this.demArr.length; i++) {
                        this.demAvgSum += this.demArr[i].votes_with_party_pct;
                    }
                    this.demAvgPerc = (this.demAvgSum / this.demArr.length).toFixed(2);
                    this.demNum = this.demArr.length;

                    this.repAvgSum = 0;
                    for (let i = 0; i < this.repArr.length; i++) {
                        if (!this.repArr[i].votes_with_party_pct){
                            this.repArr[i].votes_with_party_pct = 0;
                        } 
                        this.repAvgSum += this.repArr[i].votes_with_party_pct;
                    }
                    this.repAvgPerc = (this.repAvgSum / (this.repArr.length-1)).toFixed(2);
                    this.repNum = this.repArr.length;

                    this.indAvgSum = 0;
                    for (let i = 0; i < this.indArr.length; i++) {
                        this.indAvgSum += this.indArr[i].votes_with_party_pct;
                    }
                    this.indAvgPerc = (this.indAvgSum / this.indArr.length).toFixed(2);
                    this.indNum = this.indArr.length;

                    let percslice = (this.sortedAttendance2.length/10);
                    this.att1 = this.sortedAttendance2.slice(0,percslice);
                    this.att2 = this.sortedAttendance2.reverse().slice(0,percslice);

                    let loyslice = (this.sortedLoyalty.length/10);
                    this.loy2 = this.sortedLoyalty.slice(0,loyslice);
                    this.loy1 = this.sortedLoyalty.reverse().slice(0,loyslice);

                    for (let r = 0; r < this.sortedLoyalty.length; r++) {
                        if(!this.sortedLoyalty[r].total_votes){
                            this.sortedLoyalty[r].total_votes = 0;
                        }
                        let pctmodifier = Number(this.sortedLoyalty[r].votes_with_party_pct / 100)
                        this.sortedLoyalty[r].party_votes = Math.round(pctmodifier * this.sortedLoyalty[r].total_votes);
                    }
                    this.tableShown = true;
                })
            },
            sort (s) {
                //if s == current sort, reverse
                if(s === this.currentSort) {
                  this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
                }
                this.currentSort = s;
            },
            sort3 (s) {
                //if s == current sort, reverse
                if(s === this.currentSort3) {
                  this.currentSortDir3 = this.currentSortDir3==='asc'?'desc':'asc';
                }
                this.currentSort3 = s;
            },
            sort4 (s) {
                //if s == current sort, reverse
                if(s === this.currentSort4) {
                  this.currentSortDir4 = this.currentSortDir4==='asc'?'desc':'asc';
                }
                this.currentSort4 = s;
            },
            sort5 (s) {
                //if s == current sort, reverse
                if(s === this.currentSort5) {
                  this.currentSortDir5 = this.currentSortDir5==='asc'?'desc':'asc';
                }
                this.currentSort5 = s;
            },
            sort6 (s) {
                //if s == current sort, reverse
                if(s === this.currentSort6) {
                  this.currentSortDir6 = this.currentSortDir6==='asc'?'desc':'asc';
                }
                this.currentSort6 = s;
            }
        }
    })
}, 1000);