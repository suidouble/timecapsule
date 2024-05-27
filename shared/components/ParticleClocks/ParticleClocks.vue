<template>

    <div>
        <canvas ref="canvas" width="400" height="400"></canvas>
    </div>

</template>
<script>

// class Particle {
//     constructor(params = {}) {
//         const ran = Math.random()*360*180/Math.PI;
//         const range = params.width/2.2 - Math.random()*16;

//         this.x = 0;
//         this.y = 0;
//         this.px = params.width / 2 + (Math.cos(ran) * range);
//         this.py = params.height / 2 + (Math.sin(ran) * range);

//         this.range = range;
//         this.ran = ran;

//         this.timeFlg = false;
//     }
// }

export default {
	name: 'ParticleClocks',
	props: {
	},
	components: {
	},
	data() {
		return {
            FPS: 60,
            width: 300,
            height: 300,
            particleNum: 4000,

            nowDisp: 0, // 0 - clocks, 1 - text
		};
	},
	methods: {
		onClick: function() {
		},
        timeText() {
            var date = new Date();
            var H = (date.getHours() > 9)? date.getHours() : '0'+date.getHours();
            var M = (date.getMinutes() > 9)? date.getMinutes() : '0'+date.getMinutes();
            var S = (date.getSeconds() > 9)? date.getSeconds() : '0'+date.getSeconds();
            var timeTxt = H+':'+M+':'+S;

            return timeTxt;
        },
        drawDotLine(x, y, px, py) {
            var _x = (x > px ? 1 : -1) * (x - px);
            var _y = (y > py ? 1 : -1) * (y - py);
            var sx = (x > px) ? -1 : 1;
            var sy = (y > py) ? -1 : 1;
            var r, i;
            if (_x < 3 && _y < 3) return;
            var l,s;
            if(_x < _y){
                l = _y;
                s = _x;
                r = s/l;
                for (i = 0;i < l;i++){
                    this.setPixel(x + sx*i*r, y+sy*i);
                }
            } else {
                l = _x;
                s = _y;
                r = s/l;
                for (i = 0;i < l;i++){
                    this.setPixel(x + sx*i, y+sy*i*r);
                }
            }
        },
        setPixel(x, y){
            const idx = ((x|0) + (y|0) * this.width) * 4;
            this._data[idx+3] = 255;
        },
        delPixel(x, y){
            const idx = ((x|0) + (y|0) * this.width) * 4;
            this._data[idx+3] = 0;
        },
        faidout() {
            for (let i = 3, l = this._data.length;i < l;i+=4){
                var a = this._data[i];
                if (a !== 0){
                    if (a < 36) {
                        this._data[i] = 0;
                    } else if (a < 66) {
                        this._data[i] *= 0.96;
                    } else {
                        this._data[i] *= 0.7;
                    }
                }
            }
        },
        step() {
            this.process();
            window.requestAnimationFrame(this.step);
        },
        process() {
            let updateState = false;

            this._ctx.clearRect(0, 0, this._width, this._height);
            const time = this.timeText();
            if (this._prev_time !== time){
                updateState = true;
            }


            this._prev_time = time;
            if (updateState) {
                var textSize = 30;
                var text = time;
                this._textWidth = textSize*4.5;
                this._textHeight = textSize;
                this._setX = this._width/2 - textSize*2.25;
                this._setY = this._height/2 - textSize/2;

                this._ctx.font = textSize+"px sans-serif";
                this._ctx.textBaseline = "top";
                this._ctx.fillStyle = '#fff';
                this._ctx.fillText(text, this._setX, this._setY);
                    //     } else if(nowDisp === TEXT_VIEW) {
                    //     // テキスト
                    //     textSize = 60;
                    //     text = 'テキスト';
                    //     textWidth = textSize * text.length;
                    //     textHeight = textSize;
                    //     setX = _width/2 - textSize * text.length/2 + 15;
                    //     setY = _height/2 - textSize/2;

                    //     ctx.font = textSize+"px sans-serif";
                    //     ctx.textBaseline = "top";
                    //     ctx.fillStyle = '#fff';
                    //     ctx.fillText(text, setX, setY);
                    // }

                updateState = false;

                this._textData = this._ctx.getImageData(this._setX, this._setY, this._textWidth, this._textHeight).data;
            }

            var m, _i = 0;
            for (var x = 0; x < this._textWidth;x+=1) {
                for(var y = 0; y < this._textHeight; y+=1) {
                    var idx  = (x+y*this._textWidth)*4;
                    if(this._textData[idx] > 100) {
                        _i++;
                        m = this._particles[_i];
                        if (m) {

                            // 現在の位置から目標までの値
                            var X = x + this._setX - m.px;
                            var Y = y + this._setY - m.py;
                            var T = Math.sqrt(X*X + Y*Y);
                            // 現在の位置から目標までの角度
                            var A = Math.atan2(Y, X);
                            var C = Math.cos(A);
                            var S = Math.sin(A);

                            // 移動幅
                            m.x = m.px + C*T*0.15;
                            m.y = m.py + S*T*0.15;
                            this.setPixel(m.x+Math.random()*3-1.5, m.y+Math.random()*3-1.5);
                            this.drawDotLine(m.x, m.y, m.px, m.py);
                            m.ran += 0.0007;
                            m.timeFlg = true;
                            //m.center = true;
                            m.px = m.x;
                            m.py = m.y;

                        }
                    }
                }
            }


            // 余ったパーティクルをぐるぐるする
            for(var i = _i+1, L = this._particles.length;i < L;i++) {
                m = this._particles[i];
                m.ran += 0.0007;

                if(m.timeFlg) {
                    // 現在の位置から目標までの値
                    X = (this._width / 2 + Math.cos(m.ran*180/Math.PI) * m.range) - m.px;
                    Y = (this._height / 2 + Math.sin(m.ran*180/Math.PI) * m.range) - m.py;

                    T = Math.sqrt(X*X + Y*Y);
                    // 現在の位置から目標までの角度
                    A = Math.atan2(Y, X);
                    C = Math.cos(A);
                    S = Math.sin(A);

                    // 移動幅
                    m.x = m.px + C*T*0.15;
                    m.y = m.py + S*T*0.15;
                    if(m.x < 1 && m.y < 1) m.timeFlg = false;

                } else {
                    // 次の配置位置
                    m.x = this._width / 2 + Math.cos(m.ran*180/Math.PI) * m.range;
                    m.y = this._height / 2 + Math.sin(m.ran*180/Math.PI) * m.range;
                }

                // パーティクルを配置
                this.drawDotLine(m.x, m.y, m.px, m.py);
                //setPixel(m.x, m.y);

                m.px = m.x;
                m.py = m.y;
            }

            this._cc.putImageData(this._bit, 0, 0);

            // if (Math.random() < 0.5) {
                this.faidout();
            // }
//   count++;
//   if (count === FPS){
//     var now = Date.now();
//     var _f = 1000 / ((now - last) / count);
//     count = 0;
//     info.innerHTML = 'FPS '+_f.toFixed(2) +'<br>表示タイプ : ' + dispType[nowDisp];
//     last = Date.now();
//   }
        },
        init() {
            alert('init');
        console.error('mounted');
            const ct = document.createElement('canvas');
            const canvas = this.$refs.canvas;

            ct.width  = canvas.width  = this.width;
            ct.height = canvas.height = this.height;
            
            const ctx = ct.getContext('2d', { willReadFrequently: true });
            ctx.fillStyle = '#fff';
            ctx.willReadFrequently = true;
            // alert(1)
            // console.error(this.$refs.canvas);
            var cc = canvas.getContext("2d", { willReadFrequently: true });
            cc.willReadFrequently = true;
            cc.fillStyle = 'rgba(255,255,255,0.01)';
            cc.fillRect(0, 0, this.width, this.height);
            
            const bit = cc.getImageData(0, 0, this.width, this.height);
            this._data = bit.data;
            this._bit = bit;
            console.log(this._bit, this._data);

            console.error(this._data, 'this._data');
            cc.clearRect(0, 0, this.width, this.height);
            cc.fillStyle = "rgb(255, 255, 255)";

            this._cc = cc;

            const width = 0 + this.width;
            const height = 0 + this.height;

            function particle() {
                var ran = Math.random()*360*180/Math.PI;
                var range = width/2.2 - Math.random()*16;

                this.x = 0;
                this.y = 0;
                this.px = width/2 + (Math.cos(ran) * range);
                this.py = height/2 + (Math.sin(ran) * range);
                this.range = range;
                this.ran = ran;
            }


            this._particles = [];
            let num = this.particleNum;
            while(num){
                num--;
                this._particles[num] = new particle();
            }

            this._ctx = ctx;

            this._setX = 0;
            this._setY = 0;
            this._textWidth = 0;
            this._textHeight = 0;
            this._width = 300;
            this._height = 300;
            this._textData = null;

            setInterval(this.process, 1000/this.FPS);
            // this._drawInterval = window.requestAnimationFrame(this.step);

// var updateState = false;
// var textData;
// var prev_time;
// var textWidth;
// var textHeight;
// var setX, setY;
        },
	},
	computed: {
	},
	beforeMount: function() {
        this.particles = [];

	},
    beforeUnmount: function() {
        clearInterval(this._drawInterval);
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.init();
        });
    },
}

//  var FPS = 60;
// var _width = 400;
// var _height = 400;
// var particleNum = 5000;

// var CLOCK_VIEW = 0, TEXT_VIEW = 1;
// var nowDisp = CLOCK_VIEW;
// var particles = [];
// var ct = document.createElement('canvas');
// var ctx = ct.getContext('2d');
// ctx.fillStyle = '#fff';

// var canvas = document.getElementById("canvas");
// var info = document.getElementById("info");

// ct.width  = canvas.width  = _width;
// ct.height = canvas.height = _height;
// canvas.onclick = mouseClick;

// var cc = canvas.getContext("2d");
// cc.fillStyle = 'rgba(255,255,255,0.01)';
// cc.fillRect(0, 0, _width, _height);
// bit = cc.getImageData(0, 0, _width, _height);
// data = bit.data;
// cc.clearRect(0, 0, _width, _height);
// cc.fillStyle = "rgb(255, 255, 255)";

// var updateState = false;
// var textData;
// var prev_time;
// var textWidth;
// var textHeight;
// var setX, setY;

// function setPixel(x, y){
//   var idx = ((x|0) + (y|0) * _width)*4;
//   data[idx+3] = 255;
// }
// function delPixel(x, y){
//   var idx = ((x|0) + (y|0) * _width)*4;
//   data[idx+3] = 0;
// }
// function faidout(){
//   for (var i = 3, l = data.length;i < l;i+=4){
//     var a = data[i];
//     if (a !== 0){
//       if (a < 36) {
//         data[i] = 0;
//       } else if (a < 66) {
//         data[i] *= 0.96;
//       } else {
//         data[i] *= 0.7;
//       }
//     }
//   }
// }

// var num = particleNum;
// while(num){
//   num--;
//   particles[num] = new particle();
// }
// var last = Date.now(), count = 0;
// setInterval(process, 1000/FPS);

// function process() {
//   var dispType = ['時計', 'テキスト'];
//   ctx.clearRect(0, 0, _width, _height);
//   var time = timeDraw();
//   if (prev_time !== time){
//     updateState = true;
//   }
//   prev_time = time;
//   if(updateState){
//   if (nowDisp === CLOCK_VIEW) {
//     // 時計
//       var textSize = 60;
//       var text = time;
//       textWidth = textSize*4.5;
//       textHeight = textSize;
//       setX = _width/2 - textSize*2.25;
//       setY = _height/2 - textSize/2;

//       ctx.font = textSize+"px sans-serif";
//       ctx.textBaseline = "top";
//       ctx.fillStyle = '#fff';
//       ctx.fillText(text, setX, setY);
//     } else if(nowDisp === TEXT_VIEW) {
//     // テキスト
//       textSize = 60;
//       text = 'テキスト';
//       textWidth = textSize * text.length;
//       textHeight = textSize;
//       setX = _width/2 - textSize * text.length/2 + 15;
//       setY = _height/2 - textSize/2;

//       ctx.font = textSize+"px sans-serif";
//       ctx.textBaseline = "top";
//       ctx.fillStyle = '#fff';
//       ctx.fillText(text, setX, setY);
//   }
//   updateState = false;
//   // パーティクルを配置する座標を取得する
//     textData = ctx.getImageData(setX, setY, textWidth, textHeight).data;
//   }
//   var m, _i = 0;
//   for (var x = 0; x < textWidth;x++) {
//     for(var y = 0; y < textHeight; y++) {
//       var idx  = (x+y*textWidth)*4;
//       if(textData[idx] > 100) {
//         _i++;
//         m = particles[_i];
//         // 現在の位置から目標までの値
//         var X = x + setX - m.px;
//         var Y = y + setY - m.py;
//         var T = Math.sqrt(X*X + Y*Y);
//         // 現在の位置から目標までの角度
//         var A = Math.atan2(Y, X);
//         var C = Math.cos(A);
//         var S = Math.sin(A);

//         // 移動幅
//         m.x = m.px + C*T*0.15;
//         m.y = m.py + S*T*0.15;
//         setPixel(m.x+Math.random()*3-1.5, m.y+Math.random()*3-1.5);
//         drawDotLine(m.x, m.y, m.px, m.py);
//         m.ran += 0.0007;
//         m.timeFlg = true;
//         //m.center = true;
//         m.px = m.x;
//         m.py = m.y;
//       }
//     }
//   }
//   // 余ったパーティクルをぐるぐるする
//   for(var i = _i+1, L = particles.length;i < L;i++) {
//     m = particles[i];
//     m.ran += 0.0007;

//     if(m.timeFlg) {
//       // 現在の位置から目標までの値
//       X = (_width/2 + Math.cos(m.ran*180/Math.PI) * m.range) - m.px;
//       Y = (_height/2 + Math.sin(m.ran*180/Math.PI) * m.range) - m.py;

//       T = Math.sqrt(X*X + Y*Y);
//       // 現在の位置から目標までの角度
//       A = Math.atan2(Y, X);
//       C = Math.cos(A);
//       S = Math.sin(A);

//       // 移動幅
//       m.x = m.px + C*T*0.15;
//       m.y = m.py + S*T*0.15;
//       if(m.x < 1 && m.y < 1) m.timeFlg = false;

//     } else {
//       // 次の配置位置
//       m.x = _width /2 + Math.cos(m.ran*180/Math.PI) * m.range;
//       m.y = _height/2 + Math.sin(m.ran*180/Math.PI) * m.range;
//     }

//     // パーティクルを配置
//     drawDotLine(m.x, m.y, m.px, m.py);
//   //setPixel(m.x, m.y);

//     m.px = m.x;
//     m.py = m.y;
//   }
//   cc.putImageData(bit, 0, 0);
//   faidout();
//   count++;
//   if (count === FPS){
//     var now = Date.now();
//     var _f = 1000 / ((now - last) / count);
//     count = 0;
//     info.innerHTML = 'FPS '+_f.toFixed(2) +'<br>表示タイプ : ' + dispType[nowDisp];
//     last = Date.now();
//   }
// }

// // パーティクルの初期化
// function particle() {
//   var ran = Math.random()*360*180/Math.PI;
//   var range = _width/2.2 - Math.random()*16;

//   this.x = 0;
//   this.y = 0;
//   this.px = _width/2 + (Math.cos(ran) * range);
//   this.py = _height/2 + (Math.sin(ran) * range);
//   this.range = range;
//   this.ran = ran;
// }

// // 現在の時間を取得
// function timeDraw() {
//   var date = new Date();
//   var H = (date.getHours() > 9)? date.getHours() : '0'+date.getHours();
//   var M = (date.getMinutes() > 9)? date.getMinutes() : '0'+date.getMinutes();
//   var S = (date.getSeconds() > 9)? date.getSeconds() : '0'+date.getSeconds();
//   var timeTxt = H+':'+M+':'+S;

//   return timeTxt;
// }

// // マウスクリックイベント
// function mouseClick() {
//   if (nowDisp === CLOCK_VIEW){
//     nowDisp = TEXT_VIEW;
//   } else {
//     nowDisp = CLOCK_VIEW;
//   }
//   updateState = true;
//   return false;
// }

// // ドットで線を描く
// function drawDotLine(x, y, px, py) {
//   var _x = (x > px ? 1 : -1) * (x - px);
//   var _y = (y > py ? 1 : -1) * (y - py);
//   var sx = (x > px) ? -1 : 1;
//   var sy = (y > py) ? -1 : 1;
//   var r, i;
//   if (_x < 3 && _y < 3) return;
//   var l,s;
//   if(_x < _y){
//     l = _y;
//     s = _x;
//     r = s/l;
//     for (i = 0;i < l;i++){
//       setPixel(x + sx*i*r, y+sy*i);
//     }
//   } else {
//     l = _x;
//     s = _y;
//     r = s/l;
//     for (i = 0;i < l;i++){
//       setPixel(x + sx*i, y+sy*i*r);
//     }
//   }
// }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>