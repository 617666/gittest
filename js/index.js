/**
 * 游戏主要逻辑
 */


var mineArray = null; //存储生成的地雷数组
var mineArea = find(".mineArea");  //雷区的容器
var tableData = [];  //存储格子额外信息
var flagArray=[];  // 存储用户插旗的DOM元素
var isAllRight = true;
var btns = finds(".level>button");
var flagNum =   find(".flagNum");  //插旗数量的DOM元素
var mineNumber = find(".mineNum");
var clickCount = 0;
var ifFirst =true;
var gezi;  //没点的格子
var s_mine;  //剩的雷
var iftiaoshi;
/**
 * 生成地雷
 * @returns 返回地雷数组
 */
function initMine(){
    var arr = new Array(curLevel.row * curLevel.col);//生成对应长度的数组
    for(var i = 0;i<arr.length;i++){   //往数组里面填充值
        arr[i] = i;
    }
    arr.sort(() => 0.5-Math.random()); //打乱数组
    return arr.slice(0,curLevel.mineNum);  //保留对应雷数量的数组
    
}

/**
 * 场景重置
 */
function clearScene(){
    mineArea.innerHTML = "";
    flagArray = [];
    flagNum.innerHTML = 0;
    mineNumber.innerHTML = curLevel.mineNum;
    ifFirst = true;
    gezi = curLevel.col * curLevel.row;
    s_gezi = 0;
    s_mine = curLevel.mineNum;
}


/**
 * 游戏初始化
 */
function init(){   
    clearScene();
   // mineArray = initMine();   //1.随机生成对应数量的雷   console.log(mineArray);
    var table = document.createElement('table')  //2.生成所选配置的表格
    var index = 0;  //初始化格子的下标
    for(var i = 0; i<curLevel.row;i++){
        var tr = document.createElement("tr");
        tableData[i] = [];
        for(var j = 0;j<curLevel.col;j++){
            var td = document.createElement("td");
            var div = document.createElement("div");
            tableData[i][j] = {  //每个格子对应一个 JS 对象
                row:i,
                col:j,
                type:"number",
                value:0,  //周围雷的数量
                index,
                checked:false
            };
            div.dataset.id = index;  //为div添加下标
            div.classList.add("canFlag");  //标记可以插旗
            index++;
            // if(mineArray.includes(tableData[i][j].index)){//判断雷的格子
            //     tableData[i][j].type = "mine";
            //     div.classList.add("mine");
            // }
            tr.appendChild(td);
            td.appendChild(div);
        }
        table.appendChild(tr);
    }//console.log(table.innerHTML);console.log(tableData);

    mineArea.appendChild(table);
    
    //每次初始化重新绑定事件 mousedown而不是 click
    mineArea.onmousedown = function(e){
        if(e.button === 0){
            searchArea(e.target);
        }
        if(e.button === 2){
            flag(e.target);
        }
    }
}

/**
 * 雷初始化
 */
function mine(){
    ifFirst = true;
    mineArray = initMine();   //1.随机生成对应数量的雷   console.log(mineArray);
    console.log(mineArray);
    for(var i = 0; i<curLevel.row;i++){
        for(var j = 0;j<curLevel.col;j++){
            if(mineArray.includes(tableData[i][j].index)){//判断雷的格子
                tableData[i][j].type = "mine";
                getDOM(tableData[i][j]).classList.add("mine");
            }
        }
    }
    if(iftiaoshi){
        for(var i = 0;i < curLevel.mineNum;i++){
            if(!find(".mine").classList.contains("tiaoshi")){ 
                finds(".mine")[i].style.opacity = '0.5';
            }      
    }
}
    
}


/**
 * 游戏结束 显示答案
 */
function showAnswer(){
    var mineArr = finds("td>div.mine");  // 获取所有雷的 DOM 元素
    for(var i =0;i<mineArr.length;i++){
        mineArr[i].style.opacity=1;
    }

    for(var i = 0;i<flagArray.length;i++){
        if(flagArray[i].classList.contains("mine")){
            flagArray[i].classList.add("right");
        }else{
            flagArray[i].classList.add("error");
            isAllRight = false;
        }
    }
    if(!isAllRight){

        setTimeout(() => {
            gameOver(false)
        }, 1000);
    }
    mineArea.onmousedown = null;
}

/**
 * 找到对应 DOM 在tableData 里面的 JS 对象
 * @param {*} cell 
 */
function getTableItem(cell){  //不能classList加个标记然后find()获得吗
    var index = cell.dataset.id;
    var flatTableData = tableData.flat();
    //console.log(flatTableData.filter(item => item.index == index)[0]);
    return flatTableData.filter(item => item.index == index)[0];   //这句运行了100次？
}

/**
 * 返回该对象对应的四周的边界
 * @param {*} obj 
 */
function getBound(obj){
    var rowTop = obj.row -1 < 0 ? 0 : obj.row-1;
    var rowBottom = obj.row +1 === curLevel.row ? curLevel.row -1 : obj.row + 1;
    var colLeft = obj.col - 1 < 0 ? 0 : obj.col -1;
    var cloRight = obj.col + 1 ===curLevel.col ? curLevel.col -1 : obj.col + 1;
    return{
        rowTop,
        rowBottom,
        colLeft,
        cloRight,
    };
}
/**
 * 返回周围雷的数量
 * @param {*} obj 格子对应的 JS 对象 
 */
function findMineNum(obj){
    var count = 0;
    var {rowTop,rowBottom,colLeft,cloRight} = getBound(obj)
    for(var i=rowTop; i<=rowBottom;i++){
        for(var j = colLeft; j<=cloRight;j++){
            if(tableData[i][j].type === "mine"){
                count++;
            }
        }
    }
    return count;
}

/**
 * 根据 tableData 中的 JS 对象返回对应的 div
 * @param {*} obj
 */
function getDOM(obj){
    var divArray = finds("td>div");
    return divArray[obj.index]; //? index not defined——解决！前面的括号错误!
}

/**
 * 周围九宫格
 */
function getAround(cell){  //console.log(cell);console.log(cell.parentNode);
    var tableItem = getTableItem(cell);  //1.该 DOM 元素在tableData里面所对应的元素  console.log(tableItem);
    if(!tableItem.checked && !cell.classList.contains("flag")){  //没被插旗 才进行以下操作
        cell.parentNode.style.boader = "none";  
        cell.classList.remove("canFlag");
        // var tableItem = getTableItem(cell);  //1.该 DOM 元素在tableData里面所对应的元素  console.log(tableItem);
        if(!tableItem){
            return;
        }
        tableItem.checked = true;   
        var mineNum = findMineNum(tableItem);  //周围雷的数量
        if(!mineNum){  //没有雷 继续搜索
            var {rowTop,rowBottom,colLeft,cloRight} = getBound(tableItem);
            for(var i=rowTop; i<=rowBottom;i++){
                for(var j = colLeft; j<=cloRight;j++){
                    if(!tableData[i][j].checked){
                        //var dom = getDOM(tableData[i][j]);  console.log(dom);
                        getAround(getDOM(tableData[i][j]));
                    }                    
                }
            }
            gezi--;
            var cl=["zero","one","two","three","four","five","six","seven","eight",];
            cell.classList.add(cl[mineNum]);
        }
        else{
            var cl=["zero","one","two","three","four","five","six","seven","eight",];
            gezi--;
            cell.classList.add(cl[mineNum]);
            cell.innerHTML = mineNum;
        }
    } 
}

/**
 * 区域搜索
 * @param {*} cell 用户点击的 DOM 元素 
 */
function searchArea(cell){
    var ifmine = cell.classList.contains("mine");
    if(ifFirst && cell.classList.contains("mine")){  //第一次点击到了雷
        for(var i=0; i<curLevel.row;i++){
            for(var j = 0; j<curLevel.col;j++){
                //console.log(tableData[i][j].type);
                if(tableData[i][j].type === "mine"){  //是雷
                    tableData[i][j].type = "number";
                    getDOM(tableData[i][j]).classList.remove("mine");
                }      
                
            }
        }
        // for(var i = 0;i < curLevel.mineNum;i++){  //原来雷区删除
        //     console.log(finds(".mine")[0]); //是<div>
        //     finds(".mine")[0].type = "number"; // type不能忘了改！！！ 这样改好像没改对 
        //     console.log(finds(".mine")[0].type);
        //     finds(".mine")[0].classList.remove("mine");
        // }
        mine();  //重新生成雷
    }
    if(ifFirst && !ifmine){  //第一次点击没点到雷  //Z这里好烦啊 
        getAround(cell);
    }
    if(!ifFirst){  // 不是第一次
        if(cell.classList.contains("mine") ){   //1.是雷 游戏结束
            cell.classList.add("error");
            showAnswer();
            setTimeout(() => {
                gameOver(false)
            }, 1000);           
            return;
        }        
        getAround(cell);  //2.不是雷 判断周围雷
    }
    ifFirst = false; 
    if(gezi === s_mine){
        showAnswer();
        setTimeout(() => {
            gameOver(true)
        }, 1000);
    }
}

/**
 * 判断用户的插旗是否全部正确————剩的格子数和剩的雷数相等
 */
function isWin(){
    if(s_mine === s_gezi)
        return true;
    else return false;
   // return true;
}

/**
 * 游戏结束
 * @param {*} isWin 布尔值
 */
function gameOver(isWin){

    var mess = "";
    if(isWin){
        mess = "游戏胜利，你找出了所有的雷"; 
    }else{
        mess = "游戏失败"
    }
    window.alert(mess);
}


/**
 * 插旗
 * @param {*} cell 用户点击的 DOM 元素 
 */
function flag(cell){  //确定这里不要优化一下吗你 
    if(cell.classList.contains("canFlag")){  //可以插旗的格子
        if(flagArray.includes(cell)){   //取消插旗
            var index = flagArray.indexOf(cell);
            flagArray.splice(index,1);
            cell.classList.remove("flag");
            if(cell.classList.contains("mine")){
                s_mine++;
            }
            gezi++;
        }
        else{  //准备插旗
            if(flagArray.length < curLevel.mineNum){
                if(!flagArray.includes(cell)){   //之前没插过
                    flagArray.push(cell);  //插旗
                    cell.classList.add("flag");
                    if(cell.classList.contains("mine")){
                        s_mine--;
                    }
                    gezi--;
                }
            }
            if(flagArray.length === curLevel.mineNum){
                var result = true;
                for(var i= 0;i<flagArray.length;i++){
                    if(flagArray[i].classList.contains("mine"))
                         result = true;
                    else{
                        result = false;
                        break;
                    } 
                }
                if(result){
                    setTimeout(() => {
                        gameOver(result)
                    }, 1000);
                    if(result)
                        showAnswer();
                } 
            }
        }
        
        flagNum.innerHTML = flagArray.length;
    }
    
}


function a(cell){ 
    console.log("longtab");
    ifFirst = false;
    flag(cell)  //右键 插旗)
}

function addLongtabListener(mineArea,callback){
    let timer=0   // 初始化timer
    
    mineArea.ontouchstart=(e)=>{
        timer=0   // 重置timer
        timer=setTimeout(()=>{callback(e.target);timer=0},380)  // 超时器能成功执行，说明是长按
    }

    mineArea.ontouchmove=()=>{
        clearTimeout(timer)    // 如果来到这里，说明是滑动
        timer=0 
    }

    mineArea.ontouchend=()=>{   // 到这里如果timer有值，说明此触摸时间不足380ms，是点击
       if(timer){clearTimeout(timer)}
    }
}

addLongtabListener(mineArea,a)
/**
 * 绑定事件
 */
function bindEvent(){
    mineArea.onmousedown = function(e){  //鼠标点击事件   console.log(e.button);
        if(e.button == 0){
                searchArea(e.target);  //左键 区域搜索
        }
        if(e.button == 2){
            ifFirst = false;
            flag(e.target)  //右键 插旗
        }
    }
    mineArea.oncontextmenu = function(e){  //阻止默认的鼠标右键行为   
        e.preventDefault();  
    }
    
    find(".level").onclick = function(e){  //游戏难度选择
        for(var i =0; i<btns.length;i++){
            btns[i].classList.remove("active");
        }
        switch(e.target.innerHTML){
            case "初级":{
                curLevel = config.easy;
                btns[0].classList.add("active");
                break;
            }
            case "中级":{
                btns[1].classList.add("active");
                curLevel = config.normal;
                break;
            }
            case "高级":{
                btns[2].classList.add("active");
                curLevel = config.hard;
                break;
            }
        }

        init();
        mine();
    }
    
   find(".title").onclick = function x(e){  //游戏调试选择
    let timeFlag = true; // 是否添加计时
    clickCount += 1;
    if (clickCount >= 5) {
        // 选择是否调试
        var r = confirm("调试状态！");
        if(r){
            iftiaoshi = true;
            for(var i = 0;i < curLevel.mineNum;i++){
                if(!find(".mine").classList.contains("tiaoshi")){ 
                    finds(".mine")[i].style.opacity = '0.5';}      
            }
            //添加按钮
            find(".zuobi").style.opacity = 1;
        }
      } 
    if (timeFlag) { // 多次点击只触发一次
        timeFlag = false;
        setTimeout(() => {
        console.log(clickCount);
        clickCount = 0;
        timeFlag = true;      
        }, 2000);  //2000是5次总的
      } 
   }

   find(".zuobi").onclick = function(e){
    iftiaoshi = false;
    for(var i = 0;i < curLevel.mineNum;i++){
        if(!find(".mine").classList.remove("tiaoshi")){ 
            finds(".mine")[i].style.opacity = '0';                    }      
    }
    //添加按钮
    find(".zuobi").style.opacity = 0;
   }
}

/**
 * 主函数
 */
function main(){  
    init();   // 1.初始化游戏  
    mine();
    bindEvent();   // 2.绑定事件
    
}

main()