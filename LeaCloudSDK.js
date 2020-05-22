class LeacloudSDK {

    constructor() {
        this.best_route = null;
        this.serverList = [];
        this.result = [];
        this.onAjax = false;
        this.autoTesting = true
    }

    async init(serverList=[], interval=0, callback) {
        this.serverList = serverList;
        this.onAjax = true;
        if(this.serverList.length != 0 && this.autoTesting) {
            await this.nodeTest();
            if(callback!=null) callback();
        }
        this.onAjax = false;

        if(interval != 0 && this.autoTesting) {
            await setTimeout(()=>this.init(this.serverList, interval, callback), interval*1000*60);
        }
    }
    async nodeTest() {
        var formdata = new FormData();
        let allResult = [];
        for(let i=0; i<this.serverList.length; i++) {
            try {
                var startTime = (new Date()).getTime();
                // await this.sleep(2000);
                let request =  await this.makeRequest("GET", this.serverList[i]);
                var responseTime = (new Date()).getTime() - startTime;
                this.result.push([this.serverList[i], responseTime, startTime]);
                allResult.push([this.serverList[i], responseTime, startTime])
            } catch (e) {
                console.log(e);
                allResult.push([this.serverList[i], 0, startTime])
            }
        }
        this.onAjax = false;
        this.best_route = this.pick_best_route_so_far();
        console.log(this.result);
        formdata.append('result', JSON.stringify(allResult));
        console.log(formdata.get('result'));
        this.result = [];
        this.submitTestResult(formdata)
    }
    makeRequest(method, url, body='') {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.timeout = 1000;
            xhr.onload = function () {
                if (xhr.status == 200) {
                    resolve(url);
                } else {
                    reject({
                        url: url,
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    url: url,
                    status: xhr.status,
                    statusText: 'error'
                });
            };
            xhr.ontimeout = function() {
                reject({
                    url: url,
                    status: xhr.status,
                    statusText: 'timeout'
                });
            };
            if(body != '') {
                xhr.send(body);
            } else {
                xhr.send();
            }
        });
    }
    submitTestResult(data) {
        this.makeRequest("POST", "http://35.220.163.46:22000/sdk/receiver/", data)
        // this.makeRequest("POST", "http://localhost:8000/sdk/receiver/", data)
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    pick_best_route_so_far(resultList = this.result) {
        resultList.sort(
            function(x,y){
            if(x[1] < y[1]) return -1;
            else if(x[1] > y[1]) return 1;
            else return 0;
        });
        return resultList.map(x=>new URL(x[0]).origin);

    }
    getBestRoute(force=false) {
        if(force) {
            return this.pick_best_route_so_far()
        } else {
            if (this.best_route != null) return this.best_route;
            else {
                return this.pick_best_route_so_far()
            }
        }
    }
    delBestRoute(index=0) {
        if(this.onAjax)
            if(index == 0) {
                this.best_route.shift();
            } else {
                this.best_route.splice(index, 1);
            }
    }
    setServerList(list=[]) {
        this.serverList = list;
    }
    stopAutoTesting() {
        this.autoTesting=false;
    }
}