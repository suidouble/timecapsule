<template>

    <div class="row">
        <div class="col-2">
        &nbsp;
        </div>
        <div class="col-8">

            <div style="margin: 0 auto; width: 400px;">
                <div style="position: fixed; top: 50vh">
                    <div style="margin-top: -200px;" class="timecapsule_container" :class="{decrypting: isDecrypting}">

                        <!-- <ParticleClocks2 :text="textOnClock" @clockclick="onClockClick" color="#f5c98c" /> -->
                        <ParticleClocks2 :text="textOnClock" @clockclick="onClockClick" :color="capsuleColor" />

                        <div class="non-selectable content_info" :style="{color: capsuleColor}" v-if="timecapsule && !timecapsule.is404 && !timecapsule.decrypted" :class="{content_info_visible: showContent}" @click="onClockClick">
                            <span v-if="contentSuiAmountAsString">
                                <q-icon name="water_drop" :color="capsuleColor" /> {{contentSuiAmountAsString}} sui 
                            </span>
                                <br />
                            + secret message
                        </div>
                        <div class="non-selectable content_info_decrypted" v-if="timecapsule && !timecapsule.is404 && timecapsule.decrypted" :class="{content_info_visible: showContent}">
                            
                            {{ timecapsule.prophecy }}
                        </div>
                        <div class="non-selectable content_info_decrypted" v-if="timecapsule && timecapsule.is404" :class="{content_info_visible: showContent}">
                            Time Capsule is not found. Switch to other network maybe?
                        </div>

                    </div>
                </div>
            </div>


            <q-dialog v-model="showInfo" position="right" seamless flat square v-if="!isDecrypting">
                <q-card style="width: 350px">
                    <q-linear-progress :value="0.6" color="white" />
                    <TimecapsuleInfo :timecapsule="timecapsule" @refresh="loadInfo" />

                </q-card>
            </q-dialog>

        </div>
        <div class="col-2">
        &nbsp;
        </div>
    </div>

</template>

<script>
import ParticleClocks2 from 'shared/components/ParticleClocks/ParticleClocks2.vue';
import TimecapsuleInfo from '../components/timecapsule/TimecapsuleInfo.vue';

export default {
	name: 'Capsule',
    path: '/capsule/:id',
	props: {
	},
    components: {
        ParticleClocks2,
        TimecapsuleInfo,
    },
	data() {
		return {
            chain: 'sui:mainnet',

            showMintPopup: true,
            showRoundSignaturePopup: false,

            capsuleId: null,
            timecapsule: null,
            isDecrypting: false,

            textOnClock: '',

            showInfo: true,

            showContent: false,

            contentSuiAmountAsString: null,

            capsuleColor: '#FFFFFF',
		}
	},
    watch: {
        "$route.params.id": function() {
            alert('id');
        },
        connectionId() {
            if (this.connectionId) {
                this.loadInfo();
            }
        }
    },
	methods: {
        async onClockClick() {
            this.isDecrypting = true;
            
            if (!this.isConnected) {
                await this.$store.sui.request();
            }

            try {
                await this.timecapsule.decrypt();
                this.timecapsule.refresh();
            } catch(e) {
                console.error(e);
            }

            this.isDecrypting = false;
        },
        textInterval() {
            if (!this.timecapsule) {
                clearTimeout(this.__timeout404);
                this.textOnClock = '';
            } else {
                if (this.timecapsule.is404) {
                    this.__timeout404 = setTimeout(()=>{
                        this.textOnClock = '404';
                    }, 2000);
                } else {
                    clearTimeout(this.__timeout404);


                    if (this.timecapsule.decrypted) {
                        this.textOnClock = this.timecapsule.displayId;
                    } else {
                        if (this.timecapsule.readyToBeDecrypted) {
                            if (this.timecapsule.ownedByYou) {
                                this.textOnClock = 'open';
                            } else {
                                this.textOnClock = this.timecapsule.displayId;
                            }
                        } else {
                            this.textOnClock = this.timecapsule.displayReadyTimer;
                        }
                    }


                }

                this.showContent = true;
            }
        },
        async loadInfo() {
            this.$log.tag('CapsulePage').info('loading capsule info...');
            if (!this.timecapsule) {
                this.timecapsule = await this.$store.sui.timeCapsuleById(this.capsuleId);
            }
            if (this.timecapsule) {
                this.textOnClock = ' '+this.timecapsule.displayId;
                if (this.timecapsule.contentSuiAmount) {
                    this.contentSuiAmountAsString = await this.$store.sui.amountToString(this.timecapsule.contentSuiAmount);
                } else {
                    this.contentSuiAmountAsString = null;
                }

                if (this.timecapsule.level) {
                    if (this.timecapsule.level == 1) {
                        this.capsuleColor = '#f5c98c';
                    } else if (this.timecapsule.level > 1) {
                        this.capsuleColor = '#8ce5f5';
                    }
                }
            }
            this.$log.tag('CapsulePage').info(this.timecapsule);
        },
        onClick() {
            this.showMintPopup = true;
        },
        async switchTo(chainName) {
            this.chain = null;
            await new Promise((res)=>setTimeout(res, 500));
            this.chain = chainName;
        }
	},
    computed: {
        isConnected: function() {
            return this.$store.sui.address;
        },
        // capsuleColor: function() {
        //     if (this.timecapsule) {
        //         if (this.timecapsule.level) {
        //             if (this.timecapsule.level == 1) {
        //                 return '#f5c98c';
        //             } else if (this.timecapsule.level > 1) {
        //                 return '#8ce5f5';
        //             }
        //         }
        //     }

        //     return '#FFFFFF';
        // },
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        currentDrandRound: function() {
            return this.$store.sui.drandRound;
        },
    },
    beforeMount() {
    },
    beforeUnmount() {
        clearInterval(this.__updateTextInterval);
        clearTimeout(this.__timeout404);
    },
    mounted() {

        this.capsuleId = this.$route.params.id;
        this.__updateTextInterval = setInterval(()=>{
            this.textInterval();
        }, 1000);
        if (this.connectionId) {
            this.loadInfo();
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    h5 {
        margin: 0 0 16px 0;
    }

    .active_one {
        font-weight: bold;
    }

    .content_info {
        opacity: 0;
        cursor: pointer;
        text-align: center; 
        margin-top: -170px; 
        font-size: 20px;
        transition: opacity 1s;
    }

    .content_info.content_info_visible {
        opacity: 1;
    }

    .content_info_decrypted {
        opacity: 0;
        text-align: center; 
        margin-top: 0px; 
        font-size: 20px;
        transition: opacity 1s;    
        width: 400px;
        word-break: break-word;
    }
    .content_info_decrypted.content_info_visible {
        opacity: 1;
    }

    .timecapsule_container {
        opacity: 1;
        transition: opacity 0.5s ease;
    }
    .timecapsule_container.decrypting {
        opacity: 0.5;
    }


</style>

