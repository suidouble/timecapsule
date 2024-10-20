<template>

    <h5>Add Condenser</h5>

    <p>Condenser is the pool, that gets rewards from the Kettle and distribute them amoung TimeCapsule holders</p>

    <div>
        <q-input v-model="type_s" placeholder="Coin" hint="Coin Type S, the one expected to be staked in TimeCapsules" />

        <q-input v-model="type_r" placeholder="Coin" hint="Coin Type R, the one to be rewarded with" />

        <q-btn size="xs" label="SUI" @click="type_r = '0x2::sui::SUI'" />

        <q-input v-model="flow_interval" placeholder="Flow Interval" hint="Pediod distributing rewards" />

        <q-btn size="xs" label="1D" @click="flow_interval = 86400000" />
        <q-btn size="xs" label="1W" @click="flow_interval = 604800000" />
        <q-btn size="xs" label="30D" @click="flow_interval = 2592000000" />

        <q-input v-model="flow_amount" placeholder="Flow Amount" 
            hint="Amount(1.99 notation) of Reward Coin to be distributed each FlowInterval (Condenser can hold more, rewarding on the next periods)" />

        <q-input v-model="max_lock_time" placeholder="Max Lock Time" hint="Staking period producing the maximum weight (user can stake longer, but would get the same weight multiplier)" />

        <q-btn size="xs" label="1W" @click="max_lock_time = 604800000" />
        <q-btn size="xs" label="30D" @click="max_lock_time = 2592000000" />
        <q-btn size="xs" label="1Y" @click="max_lock_time = 31536000000" />

    </div>

    <q-btn label="Make" outline @click="make" class="q-mt-md" />

</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';

export default {
    name: 'AddCondenser',
    components:{
        // DateHuman,
    },
    props: {
    },
    data() {
        return {
            type_s: '',
            type_r: '',
            flow_interval: '',
            flow_amount: '',
            max_lock_time: '',
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async loadMore() {

        },
        async make() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.makeCondenser({
                        type_s: this.type_s,
                        type_r: this.type_r,
                        flow_interval: this.flow_interval,
                        flow_amount: this.flow_amount,
                        max_lock_time: this.max_lock_time,
                    });

                this.$q.notify({
                        spinner: true,
                        message: 'Condenser created',
                        color: 'positive',
                        timeout: 4000
                    });
            } catch (e) {
                this.$q.notify({
                        message: ''+e,
                        color: 'negative',
                        timeout: 2000
                    });

            }
        },
    },
    computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
    },
    unmounted: function() {
        clearTimeout(this.__loadMoreTimeout);
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            this.loadMore();
        }, 1000);
    }
}

    
</script>
<style lang="css">


</style>