/**
 * Created by sungjuho on 2016. 6. 10..
 */
var Player = cc.Sprite.extend({
    life:3000,
    status:1,
    vel: 0,
    accer:3,
    lastVel:0,
    lastX:0,
    lastY:0,
    ctor:function(arg)
    {
        this._super(res.r1_png);
        this.init();
        this.schedule(this.update,1/60);
    },
    init:function()
    {
        var size = cc.winSize;
        this.x = size.width/2;
        this.y = this.height/2;
        this.vel = 0;
        this.accer = 3;
        
    },
    update:function(dt)
    {
        this.eventHandling(dt);

        if(this.life < 0)
        {
            //Scene Transion to game over
        }
    },
    unmove:function()
    {
        this.vel = this.lastVel;
        this.x= this.lastX;
        this.y = this.lastY;


    },
    move:function(direction,dt)
    {
        //direction {1:hold, 2:left, 3:right}
        this.lastVel = this.vel;
        this.lastX = this.x;
        this.lastY = this.y;

        
        
        var speed = 350;
        var accer = 1200;
        var limit = 100000;



        switch(direction)
        {
            case MW.MOVE_HOLD://hold
                this.vel=0;
                break;
            case MW.MOVE_LEFT://left

                if(this.vel >=0){
                    this.vel = -speed;
                    this.accer = -accer;
                } else{
                    this.vel = this.vel + this.accer*dt/2;
                    if(this.vel < -limit )
                        this.vel = -limit;

                }
                break;
            case MW.MOVE_RIGHT://right
                if(this.vel <= 0){
                    this.vel = speed;
                    this.accer = accer;
                }
                else{
                    this.vel = this.vel + this.accer*dt/2;
                    if(this.vel>limit )
                        this.vel = limit;
                }

                break;
        }
        if(this.vel >= 1200)
            this.vel = 1200;
        else if(this.vel <= - 1200)
            this.vel = -1200;

        var d = dt * this.vel;

        //this.x += d;

        if(this.x + d <=0) {

            d = -this.x;
        }
        else if(this.x + d >= cc.winSize.width) {
            d = cc.winSize.width - this.x;
        }

//        console.log("PLAYER VEC"+this.vel);

        this.x += d;



        /*
        //Drawing Layer
        for(var i=0; i< g_sharedGameLayer.aiBox.length; ++i)
            g_sharedGameLayer.aiBox[i].x += d;

        g_sharedGameLayer.bot.boundingBoxFactor[0] += d;
        g_sharedGameLayer.bot.boundingBoxFactor[2] += d;

        g_sharedGameLayer.bot.boundingBoxNode.x = g_sharedGameLayer.bot.boundingBoxFactor[0];
        */

       // console.log("Player v : "+this.vel*dt);

    },
    eventHandling:function (dt)
    {

        //S = s0 + v*t
        //V = v0 + at
        //S = v0t + 1/2 a*t^2
        //cc._logToWebPage("Event");
        //Event Handling


        if ((MW.KEYS[cc.KEY.a] || MW.KEYS[cc.KEY.left]))
        {
            this.move(MW.MOVE_LEFT,dt);
        }

        if ((MW.KEYS[cc.KEY.d] || MW.KEYS[cc.KEY.right]) )
        {
            this.move(MW.MOVE_RIGHT,dt);
        }




    },
    collideRect:function (x,y) {
        return cc.rect(x,y,this.width,this.height);
    }



});