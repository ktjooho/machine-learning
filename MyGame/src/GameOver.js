/**
 * Created by sungjuho on 2016. 6. 13..
 */

var GameOverLayer = cc.Layer.extend({
    retryBtn:null,

    ctor:function(args){
        this.retryBtn = new ccui.create();
        this.retryBtn.setString("Play");
        this.addChild(this.retryBtn,1);
    },
    init:function(){

    },
    update:function(dt){

    },


    //시작하겠는가 하는 버튼 출력
    //


});

var GameOverScene = cc.Scene.extend({




});