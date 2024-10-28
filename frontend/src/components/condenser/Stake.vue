<template>

    <div>
        <div class="row">
            <q-btn class="col-2" outline size="sm" :label="buttonLabel" target="_blank" color="primary" @click="stake" />

            <div class="col-10">
                <div style="padding-left: 12px; position: relative;">
                    <div style="position: absolute; right: 0; bottom: -10px; opacity: 0.3">
                        Rewards Multiplier: {{ multiplierLabel }}
                    </div>
                    <q-slider switch-label-side v-model="period" :min="1" :max="17520" label-always label :label-value="periodLabel"  />
                </div>
            </div>

        </div>

        <AskAmountDialog ref="askAmountDialog" />
    </div>


</template>
<script>

import SampleProphecies from 'shared/classes/SampleProphecies.js'
import Staking from 'shared/classes/staking/Staking.js';
// import ExplorerLink from './ExplorerLink.vue';
// import Condenser from './blocks/Condenser.vue';
// import Kettle from './blocks/Kettle.vue';
import AskAmountDialog from '../ask_amount_dialog/AskAmountDialog.vue';

export default {
    name: 'Stake',
    components:{
        // DateHuman,
        // ExplorerLink,
        // Condenser,
        // Kettle,
        AskAmountDialog,
    },
    props: {
        condenser: Object,
    },
    data() {
        return {
            period: 720,
        };
    },
    computed: {
        buttonLabel: function() {
            return 'Stake ' + this.condenser.localProperties.coin_s.name;
        },
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        periodLabel: function() {
            if (this.period < 48) {
                const h = this.period;
                return ''+h+' hour'+((h > 1) ? 's' : '');
            } else if (this.period < 14*24) {
                const d = Math.floor(this.period / 24);
                return ''+d+' day'+((d > 1) ? 's' : '');
            } else if (this.period < 60*24) {
                const w = Math.floor(this.period / (7*24));
                return ''+w+' week'+((w > 1) ? 's' : '');
            } else if (this.period < (365*2*24)) {
                const m = Math.floor(this.period / (30*24));
                return ''+m+' month'+((m > 1) ? 's' : '');
            }  else {
                const y = Math.floor(this.period / (365*24));
                return ''+y+' year'+((y > 1) ? 's' : '');
            } 

            return '';
        },
        multiplierLabel: function() {
            const max_lock_time = Number(this.condenser.fields.max_lock_time);
            const plan_lock_time = this.period * 60* 60 * 1000;

            if (plan_lock_time > max_lock_time) {
                return '100x';
            }

            const x1 = max_lock_time / 100;
            const k = (plan_lock_time / x1);

            if (k > 10) {
                return Math.round(k)+'x';
            }
            if (k > 1) {
                return k.toFixed(1)+'x';
            }
            return k.toFixed(2)+'x';
        },
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async doStake() {
            const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });
            const condenser = this.condenser;
            const amount = await this.$refs.askAmountDialog.ask({
                    coinType: this.condenser.localProperties.type_s,
                });

            const message = SampleProphecies.getRandom();
            const targetTime = (new Date()).getTime() + (this.period * 60 * 60 * 1000);
            const targetDrandRound = this.$store.sui.drandEncryptor.roundAt( targetTime  );
            const messageEncrypted = this.$store.sui.drandEncryptor.encryptMessageForRound(message, targetDrandRound);

            let coinSymbol = this.condenser.localProperties.coin_s.symbol;

            let confirmation = "You are going to mint TimeCapsule with staked "+amount+" "+coinSymbol+" for "+this.periodLabel+".";
            confirmation+= "<br><br>Target dRand round: "+targetDrandRound;
            confirmation+= "<br><br>You'll be able to decrypt TimeCapsule and unstake funds at: "+(new Date(targetTime)).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            confirmation+= "<br><br>HexCapsule fee is 0.1 sui + 1% of the staked funds";

            const yes = await this.confirm(confirmation);
            if (!yes) {
                this.$q.notify({
                        message: 'Ok :)',
                        color: 'positive',
                        timeout: 1000
                    });
                return false;
            }

            await staking.stake({ 
                    condenser: condenser,
                    coinType: this.condenser.localProperties.type_s,
                    amount: amount,
                    targetDrandRound: targetDrandRound,
                    messageEncrypted: messageEncrypted,
                });

            this.$q.notify({
                    spinner: true,
                    message: 'Staked',
                    color: 'positive',
                    timeout: 4000
                });
            setTimeout(()=>{
                window.location.reload();
            }, 3000);
        },
        async confirm(message) {
            return await new Promise((res)=>{
                this.$q.dialog({
                dark: true,
                title: 'Confirm',
                html: true,
                message: message,
                cancel: true,
                persistent: true
                }).onOk(() => {
                    res(true);
                }).onCancel(() => {
                    res(false);
                });
            });
        },
        async stake() {
            try {
                await this.doStake();

                // const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });

                // const condenserId = this.condenser.id;
                // const amount = await this.$refs.askAmountDialog.ask({
                //         coinType: this.condenser.localProperties.type_s,
                //     });

                // await staking.stake({ 
                //     condenserId: condenserId,
                //     coinType: this.condenser.localProperties.type_s,
                //     amount: amount,
                //     stakeFor: (this.period * 60 * 60 * 1000),
                // });

                // this.$q.notify({
                //         spinner: true,
                //         message: 'Staked',
                //         color: 'positive',
                //         timeout: 4000
                //     });
                // setTimeout(()=>{
                //     window.location.reload();
                // }, 3000);
            } catch (e) {
                console.error(e);

                this.$q.notify({
                        message: ''+e,
                        color: 'negative',
                        timeout: 2000
                    });

            }

        },
        // async loadMore() {
        //     this.isLoading = true;


        //     const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
        //     const timecapsulesIds = await staking.getOwnedTimecapsulesIds();

        //     await staking.getExpectedRewardForCapsule({
        //         timecapsuleId: timecapsulesIds[0],
        //         condenserId: this.condenserId,
        //     });
            
        //     this.isLoading = false;
        // },
    },
    unmounted: function() {
        clearTimeout(this.__loadMoreTimeout);
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            // this.loadMore();
        }, 500);
    }
}

    
</script>
<style lang="css">


</style>