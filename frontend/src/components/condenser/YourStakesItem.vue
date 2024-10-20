<template>

            <q-card class="my-card" flat bordered style="width: 100%;">
                <q-card-section horizontal style="width: 100%;">
                    <q-card-section class="col-5">
                        <ExplorerLink :id="timecapsuleId" />
                    </q-card-section>
                    <q-card-section class="col-4">
                        &nbsp;
                    </q-card-section>
                    <q-card-actions vertical class="non-selectable	 justify-around q-px-md col-3" align="right" >
                        <div class="q-pb-xs">
                            <img src="/meta.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle; box-shadow: 0 0 2px 0px white inset, 0 0 2px 0px white;"/>&nbsp;&nbsp; 
                            250 META
                        </div>
                        <div>
                            <img src="/sui.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>&nbsp; 
                            <q-spinner-dots v-if="!rewardsAsString" color="white" size="2em" />
                            {{ rewardsAsString }}
                        </div>
                        <q-btn flat  color="primary" icon="favorite" label="Claim" @click="claim" />
                        <q-btn flat  color="accent" icon="bookmark" label="Unstake" />
                    </q-card-actions>
                </q-card-section>
            </q-card>

</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import ExplorerLink from '../common/ExplorerLink.vue';

export default {
    name: 'YourStakesItem',
    components:{
        ExplorerLink,
    },
    props: {
        timecapsuleId: String,
        condenserId: String,
    },
    data() {
        return {
            rewards: null,
            rewardsPerMinute: null,
            rewardsCheckedAt: null,
            rewardsAsString: '',
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        updateRewardAsString() {
            if (!this.rewardsCheckedAt) {
                this.rewardsAsString = '';
            } else {
                const timeDiff = (new Date()).getTime() - this.rewardsCheckedAt;
                const extra = BigInt( Math.floor( timeDiff * (Number(this.rewardsPerMinute) / 60000) ) );
                this.rewardsAsString = this._suiCoin.amountToString( this.rewards + extra ).padEnd(11, '0');
            }
        },
        async claim() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.claim({
                    condenserId: this.condenserId,
                    timecapsuleId: this.timecapsuleId,
                });

                this.$q.notify({
                        spinner: true,
                        message: 'Claimed',
                        color: 'positive',
                        timeout: 4000
                    });
                await new Promise((res)=>setTimeout(res, 2000));
                this.loadMore();
            } catch (e) {
                console.error(e);

                this.$q.notify({
                        message: ''+e,
                        color: 'negative',
                        timeout: 2000
                    });

            }

        },
        async loadMore() {
            this.isLoading = true;

            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });

            const rewards = await staking.getExpectedRewardForCapsule({
                        timecapsuleId: this.timecapsuleId,
                        condenserId: this.condenserId,
                    }); 

            this.rewards = BigInt(rewards.rewards);
            this.rewardsPerMinute = BigInt(rewards.rewardsPerMinute);
            this.rewardsCheckedAt = (new Date()).getTime();

            this._suiCoin = this.$store.sui.suiMaster.suiCoins.get('SUI');
            await this._suiCoin.getMetadata();

            console.error('rewards', rewards);
            
            this.isLoading = false;
        },
    },
    computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
    },
    unmounted: function() {
        clearTimeout(this.__loadMoreTimeout);
        clearInterval(this.__updateRewardInterval);
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            this.loadMore();
        }, 2500);

        this.__updateRewardInterval = setInterval(() => {
            this.updateRewardAsString();
        }, 50);
    }
}

    
</script>
<style lang="css">


</style>