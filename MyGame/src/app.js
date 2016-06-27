
var NUM_POO = 10
var PLAY_AI = 1


var MW = MW || {};

var  GAME_MENU = 0;
var  GAME_PLAY = 1;
var  GAME_PAUSE = 2;

MW.GAME_STATE = {
    MENU:0,
    PLAY:1,
};

MW.PLAYER_LIFE = 1;
MW.CUR_SCORE=0;
MW.MAX_SCORE=0;

MW.MOVE_HOLD = 0;
MW.MOVE_LEFT = 1;
MW.MOVE_RIGHT = 2;
MW.MOVE_NUM = 3

MW.KEYS = [];

/**
 * 5개의 똥이 떨어짐 속도는 점점 가속도가 붙는 형식
 * 터치로 움직임 조작
 *
 *
 */
var g_sharedGameLayer;

var HelloWorldLayer;
HelloWorldLayer = cc.Layer.extend({

    bot:null,
    background:null,
    playerAccel:null,
    playerVec:null,
    player: null,
    pooArr :  Array(NUM_POO*2),
    scoreLabel:null,
    maxScoreLabel:null,
    lifeLabel:null,
    gameStartLabel:null,
    tick:0,
    pooTick:0,
    aiBox:null,
    gamePlayCnt:0,


    ctor: function ()
    {
        //////////////////////////////
        // 1. super init first
       // var arr = new Array();
       // arr[2] = 3;
       // console.log("ARR[0] + "+arr[0]+3);
        this._super();

        var size = cc.winSize;

        var tArr = new Array();
        for(var i=-10; i<0; ++i)
            tArr[i] = i*2;

        console.log("T"+tArr+"SZ:"+tArr.length);

        console.log("WINDOW SIZE, W : "+size.width+", H : "+size.height);

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size

        // y[0] = "gg";

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label

        this.gameStartLabel = new cc.LabelTTF("To Game Start\n  Press enter","Arial","30");
        this.gameStartLabel.x = size.width/2;
        this.gameStartLabel.y = size.height/2 + 120;
        this.addChild(this.gameStartLabel);


        this.scoreLabel = new cc.LabelTTF("CUR:"+MW.CUR_SCORE, "Arial", 38);
        // position the label on the center of the screen
        this.scoreLabel.x = size.width / 2;
        this.scoreLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(this.scoreLabel, 5);

        this.maxScoreLabel = new cc.LabelTTF("MAX:"+MW.MAX_SCORE,"Arial",38);
        this.maxScoreLabel.x = size.width/2;
        this.maxScoreLabel.y = this.scoreLabel.y + this.scoreLabel.height ;


        this.addChild(this.maxScoreLabel,7);

        this.player = new Player(null);
        this.addChild(this.player);


        this.bot = new Bot(this.player);
        //For Debugging
        this.aiBox = new Array(this.bot.gridRowNum*this.bot.gridColNum);

        var sx = this.bot.boundingBoxFactor[2];
        var sy = this.bot.boundingBoxFactor[3];

        for(var i=0; i< this.bot.gridRowNum;++i)
        {
            for(var j=0;j < this.bot.gridColNum; ++j)
            {
                //console.log("IDX :",i*this.bot.gridColNum + j);
                this.aiBox[i*this.bot.gridColNum+j] = new cc.Sprite(res.red_png);

                var sprite = this.aiBox[i*this.bot.gridColNum+j];

                //this.addChild(sprite);

                sprite.x = sx + j * this.bot.gridWidth;
                sprite.y = sy - i * this.bot.gridHeight;
                sprite.scaleX = this.bot.gridWidth / sprite.width;
                sprite.scaleY = this.bot.gridHeight / sprite.height;
            }
        }



        this.lifeLabel = new cc.LabelTTF("Life:"+this.player.life,"Arial",30);
        this.lifeLabel.x = this.lifeLabel.width/2 + 10;
        this.lifeLabel.y = size.height - this.lifeLabel.height/2 - 10;
        this.addChild(this.lifeLabel,5);

        for(var i=0; i<this.pooArr.length; ++i )
        {
            cc._logToWebPage("성주호~ 이제 똥 만들자");
            this.pooArr[i] = new Poo(null);
           /*
            this.pooArr[i].attr({
                x : sx,
                y : sy
            });
            this.pooArr[i].setScale(0.3,0.3);
            sx += this.pooArr[i].width * 0.5;
            */
            this.addChild(this.pooArr[i],5);
        }

        var ret = cc.eventManager.addListener({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function (key,event) {
                MW.KEYS[key] = true;
            },
            onKeyReleased:function (key, event){
                MW.KEYS[key] = false;
            }
        },this);

        cc.eventManager.addListener({
            event : cc.EventListener.MOUSE,
            onMouseMove : function (event) {
                if(event.getButton()==cc.EventMouse.BUTTON_LEFT)
                    cc._logToWebPage(event._x+'and'+event._y);
                //    event.getCurrentTarget().processEvent(event);
            },
            onMouseDown : function (event) {
                cc._logToWebPage("성주호~!!! mouse down");
                cc._logToWebPage(event._x+'and'+event._y);
            }
        },this);
        g_sharedGameLayer = this;
        // add Player
        this.schedule(this.update, 1/60.0);
        this.init();
        return true;
    },
    gamePause:function()
    {
        this.player.pause();
        for(i=0;i<this.pooArr.length;++i) {
            this.pooArr[i].pause();
        }
        MW.GAME_STATE = GAME_PAUSE;

    },
    gameResume:function()
    {
        this.player.resume();
        for(i=0;i<this.pooArr.length;++i) {
            this.pooArr[i].resume();
        }
        MW.GAME_STATE = GAME_PLAY;
    },
    gameStart:function ()
    {
        cc._logToWebPage("GameStart");
        console.log("Game Play Num"+this.gamePlayCnt);
        this.gamePlayCnt++;

        this.player.init();
        this.player.resume();
        this.player.setVisible(true);

        for(var i=0;i<this.pooArr.length;++i)
        {
            this.pooArr[i].setVisible(true);
            this.pooArr[i].init();
            this.pooArr[i].resume();
        }
        //CountDown Action
        this.gameStartLabel.setVisible(false);
        this.pooTick = 0;
        MW.GAME_STATE = GAME_PLAY;

        //Bounding Box init
        this.bot.boundingBoxFactor = this.bot.getBoundingBox(this.player);
        this.bot.boundingBoxNode.x = this.bot.boundingBoxFactor[0];
        //this.bot.dirty=0;
        //Aibox init
        var sx = this.bot.boundingBoxFactor[2];
        var sy = this.bot.boundingBoxFactor[3];

        for(var i=0; i< this.bot.gridRowNum;++i)
        {
            for(var j=0;j < this.bot.gridColNum; ++j)
            {
                //console.log("IDX :",i*this.bot.gridColNum + j);
                var sprite = this.aiBox[i*this.bot.gridColNum+j];
                sprite.x = sx + j * this.bot.gridWidth;
                sprite.y = sy - i * this.bot.gridHeight;
            }
        }

    },
    gameReset:function()
    {
        if(MW.CUR_SCORE > MW.MAX_SCORE)
            MW.MAX_SCORE = MW.CUR_SCORE;

        this.player.life = MW.PLAYER_LIFE;
        this.player.setVisible(false);
        this.player.pause();

        for(i=0;i<this.pooArr.length;++i){
            this.pooArr[i].setVisible(false);
            this.pooArr[i].pause();
        }
        MW.CUR_SCORE = 0;
        this.gameStartLabel.setVisible(true);




        if(PLAY_AI)
        {
            MW.GAME_STATE = GAME_PLAY;
            this.gameStart();
        }else
        {
            MW.GAME_STATE = GAME_MENU;
        }




    },
    init:function()
    {
        //cc._logToWebPage("성주호~!!gggg");
        //if(cc.sys.capabilities.hasOwnProperty('keyboard'))


        this.gameReset();

    },
    update:function (dt)
    {
        this.lifeLabel.x = this.lifeLabel.width/2 + 10;
        this.lifeLabel.y = cc.winSize.height - this.lifeLabel.height/2 - 10;
        this.lifeLabel.setString("Life:"+this.player.life);

        this.scoreLabel.setString("Cur:"+MW.CUR_SCORE);
        this.maxScoreLabel.setString("Max:"+MW.MAX_SCORE);

        if(MW.GAME_STATE==GAME_MENU)
        {

            this.tick++;
            if(this.tick < 20) {
                this.gameStartLabel.setVisible(true);
            }
            else{
                this.gameStartLabel.setVisible(false);
            }
            if(this.tick>40)
                this.tick =0;

            if(MW.KEYS[cc.KEY.enter])
            {
                this.gameStart();
                return ;
            }

        }else if(MW.GAME_STATE==GAME_PAUSE){
            if(MW.KEYS[cc.KEY.space])
            {
                cc._logToWebPage("resume");
                this.gameResume();
               // return ;
            }
        }
        else if(MW.GAME_STATE==GAME_PLAY)
        {

            if(PLAY_AI)
            {
                this.player.move(this.bot.act(this.player,this.pooArr,dt),dt);
            }

            if(MW.KEYS[cc.KEY.space]){
                cc._logToWebPage("pause");
                this.gamePause();
                //return ;
            }


            if(this.checkIsCollide())
            {
                this.player.life--;

                this.bot.reward = -500;
                console.log("REWARD DOWN");
                if(this.player.life <= 0)
                    this.gameReset();
            }else{
                this.bot.reward = 1;
            }

            // 초 당 5개
            //0.2초에 5개
            //초당 N개
            //1/N 1개
            //60/N
            this.pooTick++;

            if(this.pooTick >= 60/NUM_POO)
            {
                for(var i=0; i<this.pooArr.length;++i){
                    var poo = this.pooArr[i];
                    if(poo.pooState == POO_STATE_DIE)
                    {
                        poo.pooState = POO_STATE_ALIVE;
                        this.pooTick = 0;
                        break; 
                    }
                }


            }




        }


        //for(int )
        //this.getSprite()
        //cc._logToWebPage(dt);
       // this.sprite.x = this.sprite.x + 1;

        //s = 1/2 * c * t^2 + v0t + d
        //v = ct + v0
        //a = dv/dt;
        //cc.Log("fuck");
        /*
        if((MW.KEYS[cc.KEY.w]) || (MW.KEYS[cc.KEY.up]))
        {
            this.sprite.y = this.sprite.y + 1;
        }
        if((MW.KEYS[cc.KEY.a]) || (MW.KEYS[cc.KEY.left]))
        {
            this.sprite.x = this.sprite.x - 1;
        }
        if((MW.KEYS[cc.KEY.d]) || (MW.KEYS[cc.KEY.right]))
        {
            this.sprite.x = this.sprite.x + 1;
        }
        */
    },
    collide:function (a,b)
    {
        return checkIntersectRect(a,b);
    },
    checkIsCollide:function()
    {
        var ret = 0;
        for(i=0; i < this.pooArr.length; i++)
        {
            if(this.collide(this.pooArr[i],this.player))
            {
                cc._logToWebPage("Crash!");
                this.pooArr[i].destroy();
                ret = 1;
            }
        }
        return ret ;
    },
});


var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }


});

function checkIntersectRect(r1,r2)
{
    var r1_l, r1_r, r1_t, r1_b;

    var r2_l, r2_r, r2_t, r2_b;

    r1_l = r1.x - r1.width * 0.45;
    r1_r = r1.x + r1.width * 0.45;
    r1_t = r1.y + r1.height * 0.45;
    r1_b = r1.y - r1.height * 0.45;

    r2_l = r2.x - r2.width * 0.45;
    r2_r = r2.x + r2.width * 0.45;
    r2_t = r2.y + r2.height * 0.45;
    r2_b = r2.y - r2.height * 0.45;

    if(r1_l < r2_r
        && r1_t >  r2_b
        && r2_l < r1_r
        && r2_t > r1_b){

        return true;
    }
    return false;



}