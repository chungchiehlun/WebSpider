# 輕輕鬆鬆用 Node.js 寫網路爬蟲

### 目錄底下有兩個專案 , 介紹如下

## Spider
#### Introduce
* 用 nodejs 寫出一個爬蟲 , 幫我們查尋機票價錢
* 目標： [香草航空訂票頁面](https://www.vanilla-air.com/reservation/ibe/ibe/booking)
* 小技巧 ：用 chrome 開發工具研究瀏覽器與 server 的 http request ＆response  ,  以及用 postman 測試 http request

#### Dependencies
> Third-party <br>
> [Cheerio](https://github.com/cheeriojs/cheerio) : 與 jQuery 相似 , 提供 DOM 操作方法 , 方便我們解析抓到的頁面 <br>
> <br>
> Built in <br>
> [Https](https://nodejs.org/api/https.html) ： 使用 https.request 像 server 發出請求取得頁面<br>
> [Querystring](https://nodejs.org/api/querystring.html) ：使用 querystring.stringify 將我們的表單資料 json 包裝成 server可解讀的形式<br>
> [File System](https://nodejs.org/api/fs.html) : 使用 fs.writeFile 將 server 端回傳的頁面存在本地 <br>

#### Basic Install
```cd spider```
<br>
```npm install```

#### Run
```node demo.js```

<br>
<br>

## Site
![alt tag](https://dl.dropboxusercontent.com/s/4t4ub0cr0miswrz/flight.png)

> 因為計畫去日本旅遊 , 但去每一個網站查詢票價太麻煩了 ,  所以把高雄到日本廉航網站都爬了一遍 ,  然後做出了這個票價查詢網站

#### Introduce
* 攻略目標: [樂桃 Peach](http://www.flypeach.com/tw/home.aspx),  [香草 Vanilla](http://www.vanilla-air.com/tw/) , [老虎 Tiger ](http://www.tigerair.com/tw/zh/) , [酷航 Scoot](https://www.flyscoot.com/index.php/zhtw/)
* 後端使用 express 架設
* 前端使用 jquery 及 uikit 完成簡單的介面

#### Basic Install
```cd site```
<br>
```npm install```
<br>
```bower install```

#### Run
```npm start```

#### Go to http://localhost:3030/  ,  Enjoy !!

## Other
如果想一起讓這個專案更強大或者發現任何問題 , 歡迎 pull request 或者聯繫我
