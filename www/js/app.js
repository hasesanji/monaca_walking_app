// This is a JavaScript file

// 【mBaaS：APIkey】
//var APPLICATIONKEY = "228e0dab7691ba35557dd7cf338b112e4ab29b1a0fa5392d3193cc311d478d74";
//var CLIENTKEY      = "70244f367d329995af5572c510e77668b8ee8f3bb550bd8e16a5b7b7070e1b4a";
var APPLICATIONKEY = "f9df5177144280199070c888fb12fdc12d5c691ad6d8a842e627cd2dd533fe13";
var CLIENTKEY      = "630102e91f9045a14e2d12249dd2cd9f1340e529c9bc497f0c882f12f8ae6d8d";

// 【mBaaS：初期化】
var ncmb = new NCMB(APPLICATIONKEY, CLIENTKEY);

// 【mBaaS：公開ファイル】
//var APPLICATION_ID = "UBoXXoAdHilVYR52";
var APPLICATION_ID = "9ZvELrCM3JVXd6qX";

// 地図
var map;
// ズーム
var ZOOM = 15;

// 位置情報
var lat;
var lng;

// マーカー
var markers = [];

//ログイン済みかを確認する
function checkCurrentUser(){
    //画面遷移時のアニメーションを設定
    var options = {
        animation: 'lift', // アニメーションの種類
        onTransitionEnd: function() {} // アニメーションが完了した際によばれるコールバック
    };

    try {
        var currentUser = ncmb.User.getCurrentUser();
        if (currentUser) {
            //ログイン済みであればホーム画面の表示
            navi.pushPage("home.html", options);
        } else {
            //未ログインであればログイン画面を表示
            navi.pushPage("login.html", options);
            
        }
    }
    catch (error) {
        console.log("error:" + error);
        logout();
    }
};

//会員登録・ログインを行う
function userLogin(isSignedUp){
    //入力フォームからユーザー名とパスワードを取得

console.log("userLogin");
    
    var userName = document.getElementById("user_name").value;
    var password = document.getElementById("password").value;
    
    //ログインを実行したあとのコールバックを設定
    var callBack_Login = function(error, obj) {
         console.log("callBack_Login");
        if (error) {
            //エラーコードの表示
            document.getElementById("login_error_msg").innerHTML = "errorCode:" + error.code + ", errorMessage:" + error.message;
        } else {
            //メニュー画面に遷移
            console.log("Home画面に遷移");

            navi.pushPage("home.html");
        }
    };
    
    //会員登録を実行したあとのコールバックを設定
    var callBack_Account = function(error, obj) {
         console.log("callBack_Account");
        
        if (error) {
            //エラーコードの表示
            document.getElementById("login_error_msg").innerHTML = "errorCode:" + error.code + ", errorMessage:" + error.message;
        } else {
            //ログインを実行
           ncmb.User.login(userName, password, callBack_Login);
        }
    };

    if (isSignedUp === false){
        //ログイン処理を実行し、上で設定されたコールバックが実行される
        ncmb.User.login(userName, password, callBack_Login);
         console.log("ncmb.User.login");
    } else {
        //会員のインスタンスを作成
        var user = new ncmb.User();
        var acl = new ncmb.Acl();
        //登録ユーザーに対するアクセス制御(読む、書き)
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(true);
        
        //ユーザー名とパスワードとスコアをインスタンスに設定
        user.set("userName", userName)
            .set("password", password)
            .set("acl", acl);//★ACLをセットするコード
        
        //会員登録を実行し、上で設定されたコールバックが実行される
        user.signUpByAccount(callBack_Account); 
    }
};

//ログアウトを実行し、ホーム画面に遷移させる
function logout(){
    ncmb.User.logout()
             .then(function(){
                 // ログアウト後処理
                 navi.resetToPage("login.html");
             })
             .catch(function(err){
                // エラー処理
                console.log("error:" + err.message);
                //未ログインの場合はログイン画面を表示
                navi.pushPage("login.html");
             });
}

// 現在地を取得する
function showMap(){
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
};

// 現在地取得成功時のコールバック
var onSuccess = function(position){
    // 現在地情報を取得
    lat = position.coords.latitude; // 緯度
    lng = position.coords.longitude; // 経度
    alert("現在位置の取得に成功しました");
    console.log("現在位置の取得に成功しました");
    // 緯度経度を画面に表示
    document.gps.lat.value=lat;
    document.gps.lng.value=lng;
    // 地図を作成
    var location = {"lat": lat, "lng": lng};
    var mapOptions = {center: location, zoom: ZOOM};
    map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);
  
    // マーカーを表示
    var marker = "images/man.png";
    markToMap(null, location, map, marker);
};

// 現在地取得失敗時のコールバック
var onError = function(error){
    alert("現在位置の取得に失敗しました");
    console.log("現在位置の取得に失敗しました");
};

// 現在地取得時に設定するオプション
var option = {
    // 取得する間隔を１秒に設定
    frequency: 1000,
    // 6秒以内に取得できない場合はonGeoErrorコールバックに渡すよう設定
    timeout: 6000
};

// マーカー追加
function markToMap(info, position, map, icon){
    var marker = new google.maps.Marker({
        position: position,
        title: info,
        icon: icon
    });
    markers.push(marker);
    marker.setMap(map);
    // 情報ウィンドウ
    if (info == "" || info == null) {
        console.log("情報ウィンドウなし");
    } else {
        console.log("情報ウィンドウあり");
        google.maps.event.addListener(marker, 'click', function() {
            var infowindow = new google.maps.InfoWindow({
                content:marker.title
            });
            infowindow.open(map,marker);
        });
    }
}

// マーカー消去
function clearMarker() {
    for (var i = 1; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    // // 現在地のみ再表示する
    // showMap();
}

function showCheckinPage() {

    lat = document.gps.lat.value;
    lng = document.gps.lng.value;

    console.log("showCheckinPage 緯度:" + lat);
    console.log("showCheckinPage 経度:" + lng);

    navi.pushPage('checkin.html');
    
}

function loadCheckinPage() {

    document.checkinfrm.lat.value = lat;
    document.checkinfrm.lng.value = lng;

    console.log("loadCheckinPage 緯度:" + lat);
    console.log("loadCheckinPage 経度:" + lng);
    
    
}

function regCheckin(){
    var title = document.checkinfrm.title.value;
    var comment = document.checkinfrm.comment.value;

    console.log("regCheckin title:" + title + ", comment:" + comment + "");

    // 現在地取得確認
    if (lat == "" || lat == null || lng == "" || lng == null) {
        // 現在地取得失敗時
        console.log("現在地情報なし");
    } else {
        // 現在地取得成功時
        console.log("現在地情報あり[lat:" + lat + ", lng:" + lng + "]");
        // 入力アラート(タイトル)
        document.title;
        if (title == null) {
            // [キャンセル]ボタン(title)が押下された場合
            alert("キャンセル(title)が押されました");
            console.log("キャンセル(title)が押されました");
        } else {
            if (title == "") {
                // 入力値が空の場合
                title ="No title.";
            }
            // 入力アラート(コメント)
            document.comment;
            if (comment == null) {
                // [キャンセル]ボタン(comment)が押下された場合
                alert("キャンセル(comment)が押されました");
                console.log("キャンセル(comment)が押されました");
            } else {
                if (comment == "") {
                    // 入力値が空の場合
                    comment ="No comment.";
                }
                // 位置情報オブジェクト作成
                var geolocation = new ncmb.GeoPoint(lat, lng);

                // 保存先クラス
                var GeoPoint = ncmb.DataStore("GeoPoint");
                
                //console.log("regCheckin 保存先クラス");

                // クラスインスタンスを生成
                var geoPoint = new GeoPoint();

                //console.log("regCheckin クラスインスタンスを生成");

                // 値の設定
                geoPoint.set("title", title);
                geoPoint.set("comment", comment);
                geoPoint.set("geolocation", geolocation);

                //console.log("regCheckin 値の設定");

                // 保存
                geoPoint.save()
                    .then(function(){
                        // 保存成功時の処理
                        alert("保存に成功しました");
                        console.log("保存に成功しました");
                        navi.popPage()
                    })
                    .catch(function(error){
                        // 保存失敗時の処理
                        alert("保存に失敗しました：" + error.message);
                        console.log("保存に失敗しました：" + error.message);
                        navi.popPage()
                });
            }
        }        
    }    
    
    
}

