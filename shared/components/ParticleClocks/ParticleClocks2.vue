<template>

    <div @click="onClick" style="cursor: pointer;" v-if="!hideEverything">
        <canvas ref="canvas" id="canvas" width="400" height="400"></canvas>
    </div>

</template>
<script>


export default {
	name: 'ParticleClocks2',
	props: {
        text: {
            type: String,
            default: "",
        },
	},
    watch: {
        text() {
            clearTimeout(this.__intoTimeout1);
            clearTimeout(this.__intoTimeout2);
            clearTimeout(this.__intoTimeout3);
            clearTimeout(this.__intoTimeout4);
            clearTimeout(this.__intoTimeout5);
            clearTimeout(this.__intoTimeout6);
            this.setText(this.text);
        },
    },
	components: {
	},
	data() {
		return {
            hideEverything: false,
		};
	},
	methods: {
        intro() {
            this.__intoTimeout1 = setTimeout(()=>{ this.setText('sui'); }, 50);
            this.__intoTimeout2 = setTimeout(()=>{ this.setText('time'); }, 1000);
            this.__intoTimeout3 = setTimeout(()=>{ this.setText('capsule'); }, 2000);
            this.__intoTimeout4 = setTimeout(()=>{ this.setText(' '); }, 2200);
            this.__intoTimeout5 = setTimeout(()=>{ this.setText('capsule'); }, 2250);
            this.__intoTimeout6 = setTimeout(()=>{ this.setText('mint'); }, 4000);
        },
        onClick() {
            this.$emit('clockclick');
        },
        setText(str) {
            if (this._setText) {
                this._setText(str);
            }
        },
        timeText() {
            var date = new Date();
            var H = (date.getHours() > 9)? date.getHours() : '0'+date.getHours();
            var M = (date.getMinutes() > 9)? date.getMinutes() : '0'+date.getMinutes();
            var S = (date.getSeconds() > 9)? date.getSeconds() : '0'+date.getSeconds();
            var timeTxt = H+':'+M+':'+S;

            return timeTxt;
        },
        init() {
            var text = "sui";
            let redrawInterval = null;
            var particles = [];

            this._setText = (str)=>{
                text = str;
            };
            this._clear = ()=>{
                clearInterval(redrawInterval);
                particles = [];
                this._setText = null;
                this._clear = null;

                this.hideEverything = true;
            };
                        
            var FPS = 50;
            var _width = 400;
            var _height = 400;
            var particleNum = 5000;

            var CLOCK_VIEW = 0, TEXT_VIEW = 1;
            var nowDisp = CLOCK_VIEW;
            var ct = document.createElement('canvas');
            var ctx = ct.getContext('2d');
            ctx.fillStyle = '#fff';

            var canvas = this.$refs.canvas;

            ct.width  = canvas.width  = _width;
            ct.height = canvas.height = _height;

            var cc = canvas.getContext("2d");
            cc.fillStyle = 'rgba(255,255,255,0.01)';
            cc.fillRect(0, 0, _width, _height);
            var bit = cc.getImageData(0, 0, _width, _height);
            var data = bit.data;
            cc.clearRect(0, 0, _width, _height);
            cc.fillStyle = "rgb(255, 255, 255)";

            var updateState = false;
            var textData;
            var prev_text;
            var textWidth;
            var textHeight;
            var setX, setY;

            function setPixel(x, y){
                var idx = ((x|0) + (y|0) * _width)*4;
                data[idx+3] = 255;
            }

            function fadeout(){
                for (var i = 3, l = data.length;i < l;i+=4){
                    var a = data[i];
                    if (a !== 0){
                        if (a < 36) {
                            data[i] = 0;
                        } else if (a < 66) {
                            data[i] *= 0.96;
                        } else {
                            data[i] *= 0.7;
                        }
                    }
                }
            }

            var num = particleNum;
            while(num){
                num--;
                particles[num] = new particle();
            }

            this.redrawInterval = setInterval(process, 1000/FPS);

            function process() {
                ctx.clearRect(0, 0, _width, _height);
                var time = text;
                if (prev_text !== time){
                    updateState = true;
                }
                prev_text = ''+text;

                if (Math.random() < 0.01) {
                    updateState = true;
                }

                if(updateState) {
                    if (nowDisp === CLOCK_VIEW) {
                        var textSize = 70;
 
                        textWidth = textSize*5;
                        textHeight = textSize;
                        setX = _width/2 - textSize*2.25;
                        setY = _height/2 - textSize/2;

                        if (text.length > 6) {
                            textSize = 40;
                        }
                        if (text.length > 8) {
                            textSize = 30;
                            textWidth = textSize * 9;
                            setX = _width/2 - textSize*3;
                        }

                        textSize = textSize + Math.random();

                        ctx.textBaseline = "middle";
                        ctx.textAlign = "center";
                        ctx.font = textSize+"px sans-serif";
                        ctx.fillStyle = '#fff';
                        ctx.fillText(text, _width/2, _height/2);
                    } else if(nowDisp === TEXT_VIEW) {
                        textSize = 60;
                        textWidth = textSize * text.length;
                        textHeight = textSize;
                        setX = _width/2 - textSize * text.length/2 + 15;
                        setY = _height/2 - textSize/2;

                        ctx.font = textSize+"px sans-serif";
                        ctx.textBaseline = "top";
                        ctx.fillStyle = '#fff';
                        ctx.fillText(text, setX, setY);
                    }
                    updateState = false;
                    textData = ctx.getImageData(setX, setY, textWidth, textHeight).data;
                }

                var m, _i = 0;
                for (var x = 0; x < textWidth;x++) {
                    for(var y = 0; y < textHeight; y++) {
                        var idx  = (x+y*textWidth)*4;
                        if(textData[idx] > 100) {
                            _i++;
                            m = particles[_i];
                            if (m) {

                                var X = x + setX - m.px;
                                var Y = y + setY - m.py;
                                var T = Math.sqrt(X*X + Y*Y);
                                                    
                                var A = Math.atan2(Y, X);
                                var C = Math.cos(A);
                                var S = Math.sin(A);

                                m.x = m.px + C*T*0.15;
                                m.y = m.py + S*T*0.15;

                                setPixel(m.x+Math.random()*3-1.5, m.y+Math.random()*3-1.5);
                                drawDotLine(m.x, m.y, m.px, m.py);
                                m.ran += 0.0007;
                                m.timeFlg = true;
                                //m.center = true;
                                m.px = m.x;
                                m.py = m.y;

                            }
                        }
                    }
                }

                for(var i = _i+1, L = particles.length;i < L;i++) {
                    m = particles[i];
                    m.ran += 0.0007;

                    if(m.timeFlg) {
                        X = (_width/2 + Math.cos(m.ran*180/Math.PI) * m.range) - m.px;
                        Y = (_height/2 + Math.sin(m.ran*180/Math.PI) * m.range) - m.py;

                        T = Math.sqrt(X*X + Y*Y);

                        A = Math.atan2(Y, X);
                        C = Math.cos(A);
                        S = Math.sin(A);

                        m.x = m.px + C*T*0.15;
                        m.y = m.py + S*T*0.15;
                        if(m.x < 1 && m.y < 1) m.timeFlg = false;

                    } else {

                        m.x = _width /2 + Math.cos(m.ran*180/Math.PI) * m.range;
                        m.y = _height/2 + Math.sin(m.ran*180/Math.PI) * m.range;
                    }

                    drawDotLine(m.x, m.y, m.px, m.py);

                    m.px = m.x;
                    m.py = m.y;
                }

                cc.putImageData(bit, 0, 0);
                fadeout();
            }

            function particle() {
                var ran = Math.random()*360*180/Math.PI;
                var range = _width/2.2 - Math.random()*16;

                this.x = 0;
                this.y = 0;
                this.px = _width/2 + (Math.cos(ran) * range);
                this.py = _height/2 + (Math.sin(ran) * range);
                this.range = range;
                this.ran = ran;
            }

            function drawDotLine(x, y, px, py) {
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
                        setPixel(x + sx*i*r, y+sy*i);
                    }
                } else {
                    l = _x;
                    s = _y;
                    r = s/l;
                    for (i = 0;i < l;i++){
                        setPixel(x + sx*i, y+sy*i*r);
                    }
                }
            }
        },
	},
	computed: {
        currentDrandRound: function() {
            return this.$store.sui.drandRound;
        },
	},
	beforeMount: function() {

	},
    beforeUnmount: function() {
        // clearInterval(this._drawInterval);
        if (this._clear) {
            this._clear();
        }
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.init();
            this.setText(this.text);
            if (!this.text) {
                this.intro();
            }
        });
    },
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>