<template>

    <div>
        <q-banner class="bg-primary text-white q-mt-md">
            Your Stakes
        </q-banner>

        <template v-for="(item) in items" v-bind:key="item.id">

            <YourStakesItem :condenserId="condenserId"  :timecapsuleId="item.id" />
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
        condenserId: String,
    },
    data() {
        return {
            items: [],
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
            const timecapsulesIds = await staking.getOwnedTimecapsulesIds();

            for (let id of timecapsulesIds) {
                const rewards = await staking.getExpectedRewardForCapsule({
                        timecapsuleId: id,
                        condenserId: this.condenserId,
                    }); 
                this.items.push({
                    id: id,
                    rewards: rewards,
                });
            }
            
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