<template>

    <div class="row">
        <div class="col-8">

            <q-card class="my-card" flat bordered style="width: 100%;" v-if="isLoading">
                <q-card-section horizontal style="width: 100%;" class="q-pa-lg">
                    <q-spinner-dots color="white" size="2em" />
                </q-card-section>
            </q-card>

            <q-card class="bg-black text-white q-mt-sm" bordered flat square>
                <q-card-section>
                    <Stake :condenser="condenser" v-if="condenser" />
                </q-card-section>
            </q-card>

            <YourStakes :condenser="condenser" v-if="condenser"  />

        </div>
        <div class="col-4">
            <div style="position: relative; cursor: arrow; width: 400px; margin: 12px auto;">
                <ParticleClocks2 :text="clocksText" />
            </div>
            <div style="text-align: center; margin-top: -12px;">
                <ExplorerLink :id="condenserId" />   
                <div style="margin-top: 12px;">
                    Supply: {{ supplyInfo }}<br/>
                    Rewards: {{ rewardsInfo }}<br/>
                </div>
                <div style="margin-top: 12px; padding: 0px 24px; opacity: 0.5">
                    Condenser is the special type of Sui object converting time from your time capsules into valuable rewards
                </div>
            </div>
        &nbsp;
        </div>
    </div>

</template>

<script>
import Staking from 'shared/classes/staking/Staking.js';
import Stake from 'components/condenser/Stake.vue';
import YourStakes from 'components/condenser/YourStakes.vue';
import ParticleClocks2 from 'shared/components/ParticleClocks/ParticleClocks2.vue';
import ExplorerLink from 'components/common/ExplorerLink.vue';
import { formatCurrency } from 'shared/classes/Format.js';

export default {
	name: 'CondenserPage',
    path: '/condenser/:id',
	props: {
	},
    components: {
        Stake,
        YourStakes,
        ParticleClocks2,
        ExplorerLink,
    },
	data() {
		return {
            chain: 'sui:mainnet',

            condenserId: null,   
            condenser: null,

            isLoading: true,

            clocksText: '',
            totalAsString: '',
		}
	},
    computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        isConnected: function() {
            return this.$store.sui.address;
        },
        supplyInfo: function() {
            if (!this.condenser || !this.condenser.localProperties || !this.condenser.localProperties.coin_s) {
                return '';
            }

            return '' + this.condenser.localProperties.coin_s.symbol;
        },
        rewardsInfo: function() {
            if (!this.condenser || !this.condenser.localProperties || !this.condenser.localProperties.coin_r) {
                return '';
            }

            return '' + this.condenser.localProperties.coin_r.symbol;
        },
    },
    watch: {
        "$route.params.id": function() {
        },
        connectionId() {
            if (this.connectionId) {
                this.loadInfo();
            }
        }
    },
	methods: {
        async stake() {

        },
        async loadInfo() {
            this.$log.tag('CondenserPage').info('LoadInfo');

            await new Promise((res)=>setTimeout(res, 300));

            const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });
            
            const condenser = await staking.getCondenser(this.condenserId);

            this.condenser = condenser;
            this.totalAsString = formatCurrency(condenser.fields.total_staked, { decimals: condenser.localProperties.coin_s._metadata.decimals} )

            console.error('this.condenser', this.condenser.fields);

            this.isLoading = false;
        },
        interval() {
            if (!this.clocksText) {
                this.clocksText = this.totalAsString;// + ' ' + this.condenser.localProperties.coin_s.symbol;
            }

            // const curTime = (new Date()).getTime();
            // if (Math.floor(curTime / 1000) % 10 < 5) {
            //     this.clocksText = '+ 0.001 TEST';

            //     setTimeout(()=>{
            //         this.clocksText = this.totalAsString;
            //     }, 500);
            // }
        },
	},
    beforeMount() {
    },
    beforeUnmount() {
        clearInterval(this.__clocksInterval);
    },
    mounted() {
        this.condenserId = this.$route.params.id;
        if (this.connectionId) {
            this.loadInfo();
        }

        this.__clocksInterval = setInterval(()=>{
            try {
                this.interval();
            } catch (e) {

            }
        }, 1000);
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

