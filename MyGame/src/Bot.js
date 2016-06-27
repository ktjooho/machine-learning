/**
 * Created by sungjuho on 2016. 6. 22..
 */

var Bot = function (player) {

   // this.reward;
    //this.qValueArray;

    //console.log("Is it function or object?");

    this.a = 1;
    this.reward;
    this.qValueArray;
    this.learningRate;
    this.discountFactor;

    this.player=player;
    this.gridRowNum;
    this.gridColNum;
    this.gridWidth;
    this.gridHeight;
    this.boundingBoxFactor;
    this.boundingBoxNode;

    this.prevState={"pos":0,"vec":0,"speed":0,"poo":0};
    this.nextState={"pos":0,"vec":0,"speed":0,"poo":0};
    this.doAction;
    this.dirty;
    this.explore;
    



    Bot.prototype.init = function ()
    {
        console.log("Init Bot");

        this.dirty = 0;
        this.gridRowNum=3;
        this.gridColNum=5;
        this.gridWidth=50;
        this.gridHeight=80;

        this.boundingBoxFactor = this.getBoundingBox(this.player);

        this.boundingBoxNode = new cc.Sprite();
        this.boundingBoxNode.width = this.gridWidth * this.gridColNum;
        this.boundingBoxNode.height = this.gridHeight * this.gridRowNum;
        this.boundingBoxNode.x = this.boundingBoxFactor[0];
        this.boundingBoxNode.y = this.boundingBoxFactor[1];




        this.explore = 0.005;
        this.reward = 1;
        this.qValueArray = new Array();
        this.learningRate = 0.3;
        this.discountFactor = 0.9;
        var size = cc.winSize;

        //VAR[POS][VEL][1][0][0][0][1][0][0][1][0][0]...[0]
       // console.log("TEST"+Math.pow(2,12));
        //PlayerPos, direction, speed,
        //11 * 2 * 4 *
        // 88 * 2^15
        // 240만개
        //2.4 * 4
        //9.6 메가
        for(var playerPos=0; playerPos<=cc.winSize.width; playerPos+=cc.winSize.width/10)
        {
            this.qValueArray[playerPos] = new Array();

            for(var d=0; d<2; ++d)
            {
                this.qValueArray[playerPos][d] = new Array();

                for(var playerVel=0;playerVel<=30;playerVel+=10)
                {
                    this.qValueArray[playerPos][d][playerVel] = new Array();
                    var limit = Math.pow(2,this.gridRowNum*this.gridColNum);
                    for(var idx=0; idx < limit; ++idx)
                    {
                        this.qValueArray[playerPos][d][playerVel][idx] = new Array();
                        for(var action=0; action<MW.MOVE_NUM; ++action)
                        {
                            this.qValueArray[playerPos][d][playerVel][idx][action] = 0;
                        }
                    }
                }
            }


        }
        var randomVal = Math.random() * 3;
        console.log("RandomVal:"+randomVal);
        randomVal = Math.ceil(randomVal);
        console.log("RandomVal:"+randomVal);
    }
    Bot.prototype.getBoundingBox=function(player)
    {
        var px = player.x;
        var py = player.y;
        var sx,sy;
        var cx,cy;

        cx = px;

        if(!(this.gridColNum%2)){
            sx = px - (Math.floor(this.gridColNum/2) - 0.5) * this.gridWidth;
        }else{
            sx = px -  Math.floor((this.gridColNum/2 )) * this.gridWidth;
        }

        cy = sy = player.height + 10 + this.gridHeight/2;
        sy += (this.gridRowNum-1) * this.gridHeight;

        if(this.gridRowNum%2){
            cy = cy + Math.floor((this.gridRowNum/2))*this.gridHeight;
        }else {
            cy = cy + (Math.floor(this.gridRowNum/2) - 0.5)*this.gridHeight;
        }



        return [cx,cy,sx,sy];
    }
    Bot.prototype.getBoxIndex=function(obj)
    {
        //get X,Y
        var sx=this.boundingBoxFactor[2],sy=this.boundingBoxFactor[3];
        var x,y;
        var dist,min=100000,val;
        var minI,minJ;

        for(var i=0; i<this.gridRowNum; ++i)
        {
            y = sy - i * this.gridHeight;

            for(var j=0; j<this.gridColNum; ++j)
            {
                x = sx + j * this.gridWidth;

                dist = Math.sqrt((x-obj.x)*(x-obj.x) + (y-obj.y)*(y-obj.y));
               // console.log("x:"+x+", y:"+y+",dist:"+dist);
                if(min>dist)
                {
                    min = dist;
                    val = Math.pow(2,i*this.gridColNum+j);
                    minI = i;
                    minJ = j;
                }
            }
        }
        //console.log("MIN_I : " + minI + "MIN_J :" + minJ);
        return val;
    }

    Bot.prototype.getNormVal=function(start,end,unit,v)
    {
        if(v>=end)
            return end;

        for(var s=start;s<end; s+=unit)
        {
            if(v >= s && v <= s+unit)
            {
                var prev = v - s;
                var next = s + unit - v;
                if(prev > next)
                    return s + unit;
                else
                    return s;
            }
        }
    }
    Bot.prototype.getNormPlayerPos=function(player)
    {
        return this.getNormVal(0,cc.winSize.width,cc.winSize.width/10,player.x);
    }
    Bot.prototype.getNormPlayerVec=function(player,dt)
    {
        var direction;

        var vel = player.vel;

       // if(vel!=0)
      //      console.log("VEL :"+vel);

        if(player.vel >= 0)
            direction = 0;
        else
            direction = 1;

        vel = Math.abs(vel)*dt;

        var speed = this.getNormVal(0,30,10,vel);

        //console.log("Direction : "+direction+" Speed:"+speed + "Vel :"+vel);

        return [direction,speed];
    }


    Bot.prototype.act = function(player, pooList,dt)
    {
        /*
        var randomVal = Math.random() * 3;
        randomVal = Math.ceil(randomVal);
        return randomVal;
        */
        //console.log("Bot Action..");
        var doAction; //HOLD, MOVE_LEFT, MOVE_RIGHT
        var pos = this.getNormPlayerPos(player);
        var vec = this.getNormPlayerVec(player,dt);
        var set2 = new Set();

        for(var i=0; i<pooList.length; ++i)
        {
            var b = pooList[i];
            //0. collision Check

            if(checkIntersectRect(b,this.boundingBoxNode))
            {
                set2.add(this.getBoxIndex(b));
            }
        }

        var idx = 0;

        for(var item of  set2)
            idx += item;

        //console.log("IDX :"+idx);
        // Q(s,a) = Q(s,a) + lr * (reward + discountFactor * max_Q(s',a)  - Q(s,a))

        this.nextState.pos = pos;
        this.nextState.vec = vec[0];
        this.nextState.speed = vec[1];
        this.nextState.poo = idx;

        //console.log("pos:"+pos+"vec"+vec[0]+"speed"+vec[1]+"poo"+idx);
        var moveLeft = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_LEFT];
        var hold = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_HOLD];
        var moveRight = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_RIGHT];

        //var action = [MW.MOVE_LEFT:this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_LEFT]];
        var actionList = new Array(3);

        actionList[MW.MOVE_LEFT] = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_LEFT];
        actionList[MW.MOVE_HOLD] = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_HOLD];
        actionList[MW.MOVE_RIGHT] = this.qValueArray[pos][vec[0]][vec[1]][idx][MW.MOVE_RIGHT];

        var maxAction = -1000000;
        var idx = -1;
        var nextAction;
        for(var idx=0; idx<MW.MOVE_NUM;++idx)
        {
            if(actionList[idx]>maxAction) {
                maxAction = actionList[idx];
                nextAction = idx;
            }

        }
       // console.log("NextAction:"+nextAction+"maxAction"+maxAction);
     //   console.log("left:"+moveLeft+",hold:"+hold+",right:"+moveRight);

        if(this.dirty)
        {
            //find best action from this current state
            var Q_S_A = this.qValueArray[this.prevState.pos][this.prevState.vec][this.prevState.speed][this.prevState.poo][this.doAction];

            this.qValueArray[this.prevState.pos][this.prevState.vec][this.prevState.speed][this.prevState.poo][this.doAction] =
                Q_S_A + this.learningRate*(this.reward + this.discountFactor * maxAction - Q_S_A);

        }else {
            this.dirty=1;
        }

        this.prevState = clone(this.nextState);

        if(cc.random0To1() <= this.explore){
            var randomVal = Math.random() * 3;
            randomVal = Math.floor(randomVal);
            console.log("RANDOM CHOOSE " + randomVal);
            this.doAction = randomVal;
        }else {
            this.doAction = nextAction;
        }

       //this.doAction = nextAction;


        return this.doAction;


        //Q 업데이트하는 시점 잡기 .

        //this.qValueArray[pos][vec[0]][vec[1]][idx];

        //GET STATE
        //var playerPos = this.getNormPlayerPos(player);
        //var
        /*
            0. get Player pos
            1. get Player vec
                if Player vec==0 then direction right,vec=0
            2. get poo list mapping to bound box

                바운딩 박스는 x=player의 x, y=120부터 시작해서 올라감
                바운딩 박스 좌상단부터는 x -= gridWidth * 2, y = 120 + gridHight*2

                 바운딩 박스 좌표 배정.
                 for(row=0; row<rowNum; ++row)
                    for(col=0; col<colNum; ++col)
                        B[row][col] = sx + (col*gridWidth) + sy - (row * gridHeight);

                 bc_y = y + gridHeight
                 bc_x = playerX
                 bc_w = gridWidth * colNum
                 bc_h = gridHeight * rowNum

                 for(poo in poolist)
                    if(collisionCheck(bc,poo))
                     for(box in b)
                        for(row=0; row<rowNum; ++row)
                            for(col=0; col<colNum; ++col)
                                if(min > dis(row,col))
                                    min = dis(row,col);
                        sum += Math.exp(2, rowNum*row + col);
                  find action = max(Q[playerPos][playerDirection][playerVec][sum])
                  return action;
         */
        //doAction = "MOVE_RIGHT";
    }

    this.init();
};
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
