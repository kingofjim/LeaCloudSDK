class LeacloudSDK {
    best_route;
    serverList = [];
    result = [];
    finished = false;

    async init(serverList=[], callback) {
        this.serverList = serverList;
        this.finished = true;
        if(this.serverList.length != 0) {
            this.nodeTest().then(callback);
        }
        this.finished = false;
    }
    async nodeTest() {
        var formdata = new FormData();
        for(let i=0; i<this.serverList.length; i++) {
            try {
                var startTime = (new Date()).getTime();
                // await this.sleep(2000);
                await this.makeRequest("GET", this.serverList[i]);
                var responseTime = (new Date()).getTime() - startTime;
                if(i==1) responseTime = 100;
                this.result.push([this.serverList[i], responseTime, startTime]);
            } catch (e) {
                console.log(e);
            }
        }
        this.finished = false;
        this.best_route = this.pick_best_route_so_far();
        formdata.append('result', JSON.stringify(this.result));
        console.log(formdata.get('result'));
        this.submitTestResult(formdata)
    }
    makeRequest(method, url, body='') {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.timeout = 1000;
            xhr.onload = function () {
                if (this.status == 200) {
                    resolve(xhr.response);
                } else {
                    reject({
                        url: url,
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    url: url,
                    status: this.status,
                    statusText: 'error'
                });
            };
            xhr.ontimeout = function() {
                reject({
                    url: url,
                    status: this.status,
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
        this.makeRequest("POST", "http://35.220.163.46:51000/sdk/receiver/", data)
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
}

function leacloudHttpDns(best_route) {
    console.log("Best_route: " + best_route);
}

var sdk = new LeacloudSDK();
var serverList = [
    'http://httpbin.org/status/300',
    'http://34.92.229.26/sdk_checked',
    'http://139.159.134.84/sdk_checked',
];
sdk.init(serverList); // 開始測速 -> 回傳測試報告
sdk.finished; // True = 結束    False = 進行中
// 無論結束 或 進行中 皆可取得目前的 BestRoute
sdk.getBestRoute(); // 快->慢 ['http://34.92.229.26', 'http://139.159.134.84']