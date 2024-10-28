<template>

    <div>
        <q-card class="bg-black text-white q-mt-sm" square bordered flat>
            <q-card-section>
            Your Staked Time Capsules
            </q-card-section>
        </q-card>

        <q-card class="my-card" flat bordered style="width: 100%;" v-if="isLoading">
            <q-card-section horizontal style="width: 100%;" class="q-pa-lg">
                <q-spinner-dots color="white" size="2em" />
            </q-card-section>
        </q-card>
        <template v-for="(item) in items" v-bind:key="item.id">

            <YourStakesItem :condenser="condenser"  :timecapsule="item" />
<!-- 
            <q-card class="my-card" flat bordered style="width: 100%;">
                <q-card-section horizontal style="width: 100%;">
                    <q-card-section class="col-5">
                        <ExplorerLink :id="item.id" />
                    </q-card-section>
                    <q-card-section class="col-4">
                        <ExplorerLink :id="item.id" />
                    </q-card-section>
                    <q-card-actions vertical class="justify-around q-px-md col-3" align="right" >
                        <q-btn flat  color="red" icon="favorite" label="Clain" />
                        <q-btn flat  color="accent" icon="bookmark" label="Unstake" />
                    </q-card-actions>
                </q-card-section>
            </q-card>

            <div>
                {{item.id}} - 
                {{item.rewards}}

            </div> -->
        </template>
    </div>


</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import ExplorerLink from '../common/ExplorerLink.vue';
import YourStakesItem from './YourStakesItem.vue';

export default {
    name: 'YourStakes',
    components:{
        ExplorerLink,
        YourStakesItem,
    },
    props: {
        condenser: Object,
    },
    data() {
        return {
            items: [],
            isLoading: true,
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async loadMore() {
            this.isLoading = true;

            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            const timecapsules = await staking.getOwnedTimecapsules();

            this.items = timecapsules;

            // for (let id of timecapsulesIds) {
            //     const rewards = await staking.getExpectedRewardForCapsule({
            //             timecapsuleId: id,
            //             condenserId: this.condenser.id,
            //         }); 
            //     this.items.push({
            //         id: id,
            //         rewards: rewards,
            //     });
            // }
            
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
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            this.loadMore();
        }, 2500);
    }
}

    
</script>
<style lang="css">


</style>