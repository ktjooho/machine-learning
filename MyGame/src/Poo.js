/**
 * Created by sungjuho on 2016. 6. 10..
 */

var  POO_STATE_ALIVE = 0;
var  POO_STATE_DIE = 1;

var Poo = cc.Sprite.extend({
    accr:0.2,
    v:5,
    tick:0,

    //state:{ALIVE:0,DIE:1},
    ctor:function (arg)
    {
        cc._logToWebPage("똥 생성 ~");
        this._super(res.red_png);
        this.init();
        this.schedule(this.update,1/120.0);
        //랜덤 위치에 생성
        //좌하단 0,0

    },
    init:function()
    {
        this.accr = 850;
        this.v = 150;
        var size = cc.winSize;
        this.x = size.width/2 + cc.randomMinus1To1() * (size.width- this.width * 0.5) * 0.5; //화면 중앙으로 전반적으로 퍼지게
        this.y = size.height + cc.random0To1() * size.height + size.height; //화면 최대 높이에서 +,- 5%
        this.tick = 0;
        this.pooState = POO_STATE_DIE;
        //this.state = this.state.ALIVE;
    },
    update:function(dt)
    {
        if(this.pooState==POO_STATE_DIE)
            return null;

        this.v = this.v + this.accr*dt/2;

        this.y = this.y - this.v*dt;

        //console.log("POO V:"+this.v*dt);
        //this.
    
        if(this.y + this.height*0.5 < -10 )
        {
           // console.log("POO DIE "+this.v*dt);
            this.destroy();
            MW.CUR_SCORE += 10;
            return ;
        }


    },
    collideRect:function(x,y)
    {
        return cc.rect(x,y,this.width,this.height);
    },
    destroy:function()
    {
        this.init();
    },


}
);