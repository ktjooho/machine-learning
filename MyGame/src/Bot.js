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

    this.player = player;
    this.gridRowNum;
    this.gridColNum;
    this.gridWidth;
    this.gridHeight;
    this.boundingBoxFactor;
    this.boundingBoxNode;

    this.prevState = {"pos": 0, "vec": 0, "speed": 0, "poo": 0};
    this.nextState = {"pos": 0, "vec": 0, "speed": 0, "poo": 0};
    this.doAction;
    this.dirty;
    this.explore;


    this.weightArray;
    this.featureSize;
    this.pooFeature;

    this.lastFeature;
    this.tempFeature;
    this.featureArray;

    this.updateQSA;

    Bot.prototype.init = function () {
        console.log("Init Bot");

        this.dirty = 0;
        this.gridRowNum = 3;
        this.gridColNum = 5;

       // this.boundingBoxFactor = this.getBoundingBox(this.player);
        /*
        this.boundingBoxNode = new cc.Sprite();
        this.boundingBoxNode.width = this.gridWidth * this.gridColNum;
        this.boundingBoxNode.height = this.gridHeight * this.gridRowNum;
        this.boundingBoxNode.x = this.boundingBoxFactor[0];
        this.boundingBoxNode.y = this.boundingBoxFactor[1];
        */

        this.explore = 0.00;
        this.reward = 1;
        // this.qValueArray = new Array();
        this.learningRate = 0.05;
        this.discountFactor = 0.9;

        var size = cc.winSize;


        this.gridWidth = size.width * 0.75;
        this.gridHeight = size.height;

        this.featureSize = (this.gridWidth * this.gridHeight) + 1;
        this.featureSize = 6;

        this.weightArray = new Array(this.featureSize);
        this.featureArray = new Array(this.featureSize);
        this.lastFeature = new Array(this.featureSize);
        this.tempFeature = new Array(this.featureSize);


        for (var i = 0; i < this.weightArray.length; ++i)
        {
            this.weightArray[i] = 0;
        }

        var randomVal = Math.random() * 3;
        console.log("RandomVal:" + randomVal);
        randomVal = Math.ceil(randomVal);
        console.log("RandomVal:" + randomVal);
    }
    Bot.prototype.fillColor = function(player, poo){
        //좌하단
        var player_center_x = this.gridWidth / 2;

        var relative_dist_x = poo.x - player.x;

        var poo_x = player_center_x + relative_dist_x;
        var poo_y = poo.y;

        console.assert(poo_x>=0 || poo_x <=this.gridWidth,"Index Calculate Error poo_x:"+poo_x+"+" +
            "Player_center_x :"+player_center_x + "Relative_dist :"+relative_dist_x);

        var sx = poo_x - poo.width/2;
        var sy = poo_y - poo.height/2;

        sx = Math.floor(sx);
        sy = Math.floor(sy);

        var c =  1 / (poo.width * poo.height*NUM_POO*10);

        var max = 1;
        var min = 0.6;
        var d =  (min - max) / (this.gridWidth - 0);
        var k = d * Math.abs(relative_dist_x) + max;
        k = k * (1 - (poo_y / cc.winSize.height));
        var ck = c*k;
        //(H-1)*W + (W-1)
        // H*W - W + W -1

        for(var i = sy; i< sy+poo.height; ++i)
        {
            if(i >= this.gridHeight || i < 0) continue;
            for(var j=sx; j<sx+poo.width; ++j)
            {
                if(j<0 || j>= this.gridWidth) continue;

                /*
                if(this.featureArray[i*this.gridWidth+j] > 0 && this.featureArray[i*this.gridWidth+j] < c){
                    console.log("wtf!!! I:"+i+"J:"+j);
                }
                */
                // this.weightArray[i*this.gridWidth + j] = c * k;
                // console.assert(this.featureArray[i*this.gridWidth+j] >= 0 && this.featureArray[i*this.gridWidth+j]<c*k,"WTF Redundant : "+this.featureArray[i*this.gridWidth+j]+"I:"+i+",J:"+j);
                // console.assert(i*this.gridWidth + j < this.featureSize, "SIZE ERROR : "+i*this.gridWidth + j );
                this.featureArray[i*this.gridWidth+j] = c;
            }
        }

    }
    Bot.prototype.getNormVal = function (start, end, unit, v) {
        if (v >= end)
            return end;

        for (var s = start; s < end; s += unit) {
            if (v >= s && v <= s + unit) {
                var prev = v - s;
                var next = s + unit - v;
                if (prev > next)
                    return s + unit;
                else
                    return s;
            }
        }
    }
    Bot.prototype.getNormMinMax = function (val, min, max) {
        if (val < min)
            return 0;
        if (val > max)
            return 1;

        return (val - min) / (max - min);
    }
    Bot.prototype.getNormPlayerPos = function (player) {

        return this.getNormVal(0, cc.winSize.width, cc.winSize.width / 10, player.x);

    }
    Bot.prototype.getNormPlayerVec = function (player, dt) {
        var direction;

        var vel = player.vel;

        // if(vel!=0)
        //      console.log("VEL :"+vel);

        if (player.vel >= 0)
            direction = 0;
        else
            direction = 1;

        vel = Math.abs(vel) * dt;

        var speed = this.getNormVal(0, 30, 10, vel);

        //console.log("Direction : "+direction+" Speed:"+speed + "Vel :"+vel);

        return [direction, speed];
    }
    Bot.prototype.getHeightDiff = function (player, poo) {
        var ds;

        if (player.vel > 0) {
            //우측은 좌측까지만
            //  ㅇ
            // ㅇ
            if (poo.x <= player.x) return poo.y;
            ds = Math.abs(poo.x - poo.width / 2 - (player.x + player.width / 2));

        } else {
            //좌측은 우측까지만
            // ㅇ
            //    ㅇ
            if (poo.x >= player.x) return poo.y;
            ds = Math.abs(poo.x + poo.width / 2 - (player.x - player.width / 2));
        }
        var ds = Math.abs(poo.x - player.x);
        var min = screen.height * 2;
        //v = v0 + at
        //s = s0 + v0t + (1/2)a*t^2
        // v0*t + (1/2)a*t^2 = ds
        // player.vel*t + (1/2)*player.accer*t = ds
        // a*t^2 + b*t -ds = 0;
        //
        var unit = 1 / 60;
        var getT;

        for (var t = unit; t <= 2.0; t += unit) {

            var d = Math.abs(player.vel * t + 0.5 * player.accer * t * t) - ds;

            d = Math.abs(d);

            if (min > d) {
                min = d;
                getT = t;
            }
        }
        return poo.y - (poo.v * getT + 0.5 * poo.accr * getT * getT);
        // poo.y - (poo.v*getT + 0.5*poo.accr*geT*getT)

    }
    Bot.prototype.getFeature2 = function(player, pooList)
    {
        // var f = new Array(this.featureSize);
        var screen = cc.winSize;
        for(var i=0; i<this.featureSize; ++i)
            this.featureArray[i] = 0;

        this.featureArray[this.gridWidth * this.gridHeight] = 1; //Constant
        var c = 1 / (pooList[0].width * pooList[0].height*NUM_POO*10);
        c = c * 0.000001;
        var d;

        if(player.x + this.gridWidth * 0.5 > screen.width){
            d = player.x + this.gridWidth*0.5 - screen.width;
            d = Math.ceil(d);
            // console.log("OverFlow D:"+d+",idx:"+this.gridWidth - d);
            for(var i=0; i<this.gridHeight; ++i){
                for(var j=this.gridWidth - d; j < this.gridWidth; ++j){
                    this.featureArray[i*this.gridWidth + j] = c;
                }
            }
            //
        }else if(player.x - this.gridWidth*0.5 < 0){
            d = -(player.x - this.gridWidth*0.5);
            //0번부터
            d = Math.ceil(d);
            // console.log("UnderFlow D:"+d+",idx:"+0);
            for(var i=0; i<this.gridHeight; ++i)
            {
                for(var j=0; j<d; ++j){
                    this.featureArray[i*this.gridWidth + j] = c;
                }
            }
        }

        for(var i=0; i<pooList.length; ++i)
            this.fillColor(player,pooList[i]);

        //return f;
    }
    Bot.prototype.getFeature = function (player, pooList) 
    {
        if(this.featureSize > 100)
            return this.getFeature2(player,pooList);
        // var f = new Array(this.featureSize);
        var screen = cc.winSize;

        for (var i = 0; i < this.featureSize; ++i)
            this.featureArray[i]=0;

        this.featureArray[0] = 1;

        for (var i = 0; i < pooList.length; ++i) {
            if (checkIntersectRect(pooList[i], player)) {
                this.featureArray[4] = NUM_POO / (1.8);
                break;
            }
        }


        //X좌표 기준으로 정렬
        pooList.sort(function (a, b) {
            return a.x < b.x ? -1 : a.x > b.x ? 1 : 0;
        });

        var boundHeight = screen.height * 2;
        var boundMinDist = screen.width * 2;
        var l = 0, r = screen.width;
        var holdIdx=-1;
        var colFront = -1, colTail;
        var isSafe = 0;
        var curHeight, linkHeight, predictHeight;


        for (var i = 0; i <= pooList.length; ++i) {
            if ((i < pooList.length) && ( pooList[i].y > screen.height || pooList[i].y - pooList[i].height / 2 < 0))
                continue;

            if (
                (i < pooList.length) &&
                (pooList[i].x - (pooList[i].width / 2) < player.x + (player.width / 2)
                &&
                player.x - (player.width / 2) < pooList[i].x + (pooList[i].width / 2))
            ) {
                if (boundHeight > pooList[i].y)
                    boundHeight = pooList[i].y;

                if (player.vel == 0)
                    this.featureArray[1] = 1 - boundHeight / screen.height;

                if (colFront == -1)
                    colFront = i;

                colTail = i;
            }

            if (i == pooList.length)
                r = screen.width;
            else
                r = pooList[i].x - pooList[i].width / 2;

            // 플레이어의 위치 변화에 따른 (X좌표만 변함)
            // console.assert(l<r,"L<R Assert l:"+l+"r:"+r);

            if ((l < r) && (r - l) > player.width) {
                //insert
                //높이에 관한 것
                var d;
                if ((r < player.x + player.width / 2) && player.vel <= 0) //블록이 player기준 좌측에 있는 경우
                {
                    d = player.x + player.width / 2 - r;
                }
                else if ((l > player.x - player.width / 2) && player.vel >= 0) //블록이 player 기준 우측에 있는 경우
                {
                    d = l - (player.x - player.width / 2);
                }
                else if (l <= player.x - player.width / 2 && player.x + player.width / 2 <= r) //player가 이미 블록안에 들어감
                {
                    //안에 포함되는 경우.
                    boundMinDist = 0;
                    boundHeight = screen.height;
                    isSafe = 1;
                    break;
                }
                if (boundMinDist > d) {
                    boundMinDist = d;
                    holdIdx = i;
                    this.featureArray[5] = 0;//(1 - ((r-l) / screen.width))*0.01;
                }
            }
            if(i < pooList.length)
                l = r + pooList[i].width;
        }

        var meanHeight = screen.height*2, s, t;

        if (!isSafe) {
            if (player.vel < 0) {
                s = holdIdx;
                t = colTail + 1;
            }
            else if (player.vel > 0) {
                //collisionFrontIdx to holdIdx
                s = colFront;
                t = holdIdx;
            } else {
                //s = colFront;
                //t = colTail+1;
                s = t = 0;
                meanHeight = boundHeight;
            }
            console.assert(s <= t,"T>S PROBLEM t "+t+",s:"+s+"PlayerVel:"+player.vel + "Hold idx:"+holdIdx);
            console.assert(s>=0 || t>=0, "0 index problem T:"+t+"S:"+s);
            if(s>=pooList.length+1 || t>=pooList.length+1){
                console.log("suck");
            }
            if(typeof  holdIdx == "undefined"){
                console.log("fuck");
            }

            console.assert(s<=pooList.length || t <= pooList.length,"Index error t:"+t+"s:"+s+"POO LEN:"+pooList.length);

            if(holdIdx == -1){
                meanHeight = 0;
            }

            for (var i = s; i < t && (holdIdx != -1); ++i) {

                if (pooList[i].y > screen.height || pooList[i].y - pooList[i].height / 2 < 0)
                    continue;

                /*
                 var predictPoo_y = this.getHeightDiff(player,pooList[i]);

                 if(predictPoo_y + pooList[i].height/2 <= 0)
                 continue;

                 var d = predictPoo_y - player.y;
                 if(meanHeight > d)
                 meanHeight = d;
                 */

                // 대략
                // player.x =>
                // 
                //meanHeight += pooList[i].y;

                if (meanHeight > pooList[i].y)
                    meanHeight = pooList[i].y;
            }
        } else {
            meanHeight = screen.height;
        }
        /*
         1. 현재 충돌범위에드는 똥의 y좌표 최소값 // curHeight
         2. 연결되어있는 똥중에서 y좌표 최소값(안전지대 나오기전까지) // linkHeight
         3. 이동 범위를 미리고려했을때, 나오는 똥중에서 y좌표 최소값 // predictHeight
         움직이지 않는 경우는 전부 다 똑같게 처리함.
         해보고, 점수가 잘 안나오면 2번으로 처리함.
         */
        this.featureArray[2] = boundMinDist / screen.width;
        this.featureArray[3] = (1 - (meanHeight / screen.height)) * 1.5;

        /*
         for(var i=0; i<this.featureSize; ++i)
         console.log("W"+i+":"+this.weightArray[i]);
         */

        for (var i = 0; i < this.featureSize; ++i) {
            this.featureArray[i] = this.featureArray[i] / (this.featureSize * 5);
        }

         // return f;
    }
    Bot.prototype.dotProduct = function (x, y) {
        var sum = 0;

        if (x.length != y.length)
            assert("What the hack fuck you");
        else
            for (var i = 0; i < x.length; ++i)
                sum += x[i] * y[i];

        return sum;
    }
    Bot.prototype.getQSA = function (player, pooList, action) {
        if (player.life <= 0)
            return 0;

        // var p = clone(player);
        // p.move(action,1/60);
        // Action을 취하면 모든 feature값이 다 변해야되는건가

        player.move(action, 1 / 60);


        /*
         for(var i=0; i<pooList.length; ++i)
         pooList[i].move(1/60);
         */

        // var f = this.getFeature(player, pooList);
        this.getFeature(player,pooList);
        player.unmove();

        /*
         for(var i=0; i<pooList.length; ++i)
         pooList[i].unmove();
         */
        var sum = this.dotProduct(this.featureArray, this.weightArray);
        // f = null;
        return sum;
    }
    Bot.prototype.update = function (player, pooList) {
        var maxAction = -1000000;
        var nextAction = -1;
        var idx = -1;

        // var feature = this.getFeature(player, pooList);
        //this.getFeature(player,pooList);


        var sum = 0;


        if (cc.random0To1() <= this.explore) {
            var randomVal = Math.random() * 3;
            randomVal = Math.floor(randomVal);
            console.log("RANDOM CHOOSE " + randomVal);
            maxAction = this.getQSA(player,pooList,randomVal);
            nextAction = randomVal;

            for(var i=0; i<this.featureSize; ++i)
                this.tempFeature[i] = this.featureArray[i];

        }else{

            var possibleAction = new Array(MW.MOVE_NUM);

            for (var i = 0; i < possibleAction.length; ++i) {
                possibleAction[i] = i;
            }

            if (player.x == 0)
                possibleAction[MW.MOVE_LEFT] = -1;
            if (player.x == cc.winSize.width)
                possibleAction[MW.MOVE_RIGHT] = -1;

            for (var i = 0; i < possibleAction.length; ++i) {
                if (possibleAction[i] < 0) {
                    // console.log("getout:"+i);
                    continue;
                }
                // console.log("I:"+i);
                sum = this.getQSA(player, pooList, i);

                if (sum > maxAction) {
                    maxAction = sum;
                    nextAction = i;
                    for(var j=0; j<this.featureSize; ++j)
                        this.tempFeature[j] = this.featureArray[j];
                    // console.log("TEMP SETUP");
                }

            }
            possibleAction = null;
        }
        //   console.log("NextAction : "+nextAction+" Q_S_A : " + maxAction);

        if (this.dirty) {

            var diff = this.reward + this.discountFactor * maxAction; // result value
            var q_s_a = this.updateQSA; //predict value

            // console.log("DIFF : "+diff+", UPDATE_Q_S_A : "+q_s_a);

            if (maxAction == 0 && this.lastFeature[2] > 0) {
                console.log("ZERO SUM" + this.lastFeature[2] + "WEIGHT" + this.weightArray[2]);
            }
            for (var i = 0; i < this.featureSize; ++i) {
                var w = this.weightArray[i];
                //   console.log("W "+i+" : "+w);
                this.weightArray[i] = w + this.learningRate * (diff - q_s_a) * this.lastFeature[i];
            }
        } else {
            this.dirty = 1;
        }
        //console.log("W_1 : "+this.weightArray[1]+", W_2:"+this.weightArray[2]+",W_3:"+this.weightArray[3]+",W_4:"+this.weightArray[4]);
        // this.lastFeature = feature;

        for(var i=0; i<this.featureSize;++i)
            this.lastFeature[i] = this.tempFeature[i];

        this.updateQSA = maxAction;

        this.doAction = nextAction;

        return this.doAction;
    }
}
