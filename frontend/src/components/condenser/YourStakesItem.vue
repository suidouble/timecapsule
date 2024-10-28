<template>

            <q-card class="my-card" flat bordered square style="width: 100%;" v-if="hasSomething || isLoading">
                <q-card-section horizontal style="width: 100%;">
                    <q-card-section class="col-5" v-if="isLoading">
                        <q-spinner-dots color="white" size="2em" />
                    </q-card-section>

                    <q-card-section class="col-5" v-if="!isLoading">
                        
                        <div class="q-pb-xs">
                            <img src="/fomo.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle; box-shadow: 0 0 2px 0px white inset, 0 0 2px 0px white;"/>&nbsp;&nbsp; 
                            {{stakedAsString}} {{ stakedCurrencyName }}

                            <q-btn :to="'/capsule/'+timecapsule.id" flat round size="xs"  color="white" icon="open_in_new" class="no-border" />
                        </div>
                        <div v-if="!mayBeUnstaked" class="q-mt-sm">
                            Till: {{ mayBeDecryptedAtAsString }}
                        </div>
                        <div v-if="mayBeUnstaked" class="q-mt-sm">
                            <q-btn v-if="mayBeUnstaked && hasSomethingToBeyBeUnstaked" outline  color="accent" icon="price_check" label="Unstake" @click="unstake" />                            
                        </div>

                    </q-card-section>
                    <q-card-actions  v-if="!isLoading" vertical class="non-selectable	 justify-around q-px-md col-7" align="right" >

                        <div>
                            <img src="/fomo.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>&nbsp; 
                            <q-spinner-dots v-if="!rewardsAsString" color="white" size="2em" />
                            {{ rewardsAsString }} {{ rewardCurrencyName }}
                        </div>
                        <q-btn v-if="needToReatach" flat  color="primary" icon="playlist_add" label="Attach" @click="claim" />

                        <q-btn outline  color="primary" icon="favorite" label="Claim" @click="claim" />
                        
                    </q-card-actions>
                </q-card-section>
            </q-card>

</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import { formatCurrency } from 'shared/classes/Format.js';
import ExplorerLink from '../common/ExplorerLink.vue';

export default {
    name: 'YourStakesItem',
    components:{
        ExplorerLink,
    },
    props: {
        timecapsule: Object,
        condenser: Object,
    },
    data() {
        return {
            isLoading: true,

            rewards: null,
            rewardsPerMinute: null,
            rewardsCheckedAt: null,
            rewardsAsString: '',
            
            condenserAmount: null, // fields in condenser,
            timecapsuleAmount: null, // fields in timecapsule,
            stakedAsString: '',  // from timecapsule

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
        async unstake() {
            try {
                const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });
                await staking.unstake({
                    condenser: this.condenser,
                    timecapsule: this.timecapsule,
                });

                this.$q.notify({
                        spinner: true,
                        message: 'Unstaked',
                        color: 'positive',
                        timeout: 4000
                    });
                await new Promise((res)=>setTimeout(res, 2000));
                window.location.reload();

            } catch (e) {
                console.error(e);

                this.$q.notify({
                        message: ''+e,
                        color: 'negative',
                        timeout: 2000
                    });

            }

        },
        async claim() {
            try {
                const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });
                await staking.claim({
                    condenserId: this.condenser.id,
                    timecapsuleId: this.timecapsule.id,
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

            const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });

            const rewards = await staking.getExpectedRewardForCapsule({
                        timecapsule: this.timecapsule,
                        condenser: this.condenser,
                    }); 

            this.rewards = BigInt(rewards.rewards);
            this.rewardsPerMinute = BigInt(rewards.rewardsPerMinute);
            this.rewardsCheckedAt = (new Date()).getTime();

            this.condenserAmount = BigInt(rewards.stakeAmount);

            this._suiCoin = this.$store.sui.suiMaster.suiCoins.get('SUI');
            await this._suiCoin.getMetadata();

            console.error('rewards', rewards);

            this.timecapsuleAmount = await this.timecapsule.getStoredCoinAmountRaw({ coinType: this.condenser.localProperties.type_s });
            this.stakedAsString = formatCurrency(this.timecapsuleAmount, { decimals: this.condenser.localProperties.coin_s._metadata.decimals} )
            
            this.isLoading = false;
        },
    },
    computed: {
        needToReatach: function() {
            if (this.timecapsuleAmount && this.timecapsuleAmount > this.condenserAmount) {
                if (this.timecapsule && this.timecapsule.readyToBeDecrypted) {
                    return false;
                }

                return true;
            }
            return false;
        },
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        stakedCurrencyName: function() {
            if (this.condenser && this.condenser.localProperties && this.condenser.localProperties.coin_s) {
                return this.condenser.localProperties.coin_s.symbol;
            }
            return '';
        },
        rewardCurrencyName: function() {
            if (this.condenser && this.condenser.localProperties && this.condenser.localProperties.coin_r) {
                return this.condenser.localProperties.coin_r.symbol;
            }
            return '';
        },
        mayBeDecryptedAtAsString: function() {
            if (this.timecapsule && this.timecapsule.mayBeDecryptedAtAsDate) {
                return this.timecapsule.mayBeDecryptedAtAsDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            }
        },
        mayBeUnstaked: function() {
            if (this.timecapsule && this.timecapsule.readyToBeDecrypted) {
                return true;
            }
            return false;
        },
        hasSomethingToBeyBeUnstaked: function() {
            if (this.timecapsule && this.timecapsule.readyToBeDecrypted && this.timecapsuleAmount > 0n) {
                return true;
            }
            return false;
        },
        hasSomething: function() {
            if (this.timecapsuleAmount > 0n || this.condenserAmount > 0n) {
                return true;
            }
            return false;
        },
    },
    unmounted: function() {
        clearTimeout(this.__loadMoreTimeout);
        clearInterval(this.__updateRewardInterval);
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            this.loadMore();
        }, 500);

        this.__updateRewardInterval = setInterval(() => {
            this.updateRewardAsString();
        }, 50);
    }
}

    
</script>
<style lang="css">


</style>