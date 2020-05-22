function testCallBack () {
    console.log('callback');
}

var serverList = [
    'http://httpbin.org/status/300',
    'http://httpbin.org/status/200',
    'http://34.92.229.26/sdk_checked',
    'http://139.159.134.84/sdk_checked',
];
var sdk = new LeacloudSDK();
/*
    @serverList  測試對象
    @interval 自動測試 單位為(分鐘)
        0 => 測試只啟動一次
        interval > 1 => 啟動自動線路測試
    @callback 測試一完成後自動執行
*/
sdk.init(serverList, 1, testCallBack); // 開始測速 -> 回傳測試報告

// True = 測速結束    False = 目前有測速進行中
sdk.onAjax;

// 無論結束 或 進行中 皆可取得目前的 BestRoute
sdk.getBestRoute(); // 快->慢 ['http://34.92.229.26', 'http://139.159.134.84']

// 終止自動化測試
sdk.stopAutoTesting();







