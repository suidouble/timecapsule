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

            <YourStakesItem :condenser="condenser" :timecapsule="item" @loaded="itemLoaded" />

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
            timecapsules: [], // all list
            items: [],        // added for rendering
            isLoading: true,
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        itemLoaded() {
            if (this.timecapsules.length) {
                const item = this.timecapsules.shift();
                this.items.push(item);
            }
        },
        async loadMore() {
            this.isLoading = true;

            const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });
            this.timecapsules = await staking.getOwnedTimecapsules();

            this.items = [];
            const item1 = this.timecapsules.shift();
            if (item1) {
                this.items.push(item1);
            }
            const item2 = this.timecapsules.shift();
            if (item2) {
                this.items.push(item2);
            }
            // const item3 = this.timecapsules.shift();
            // if (item3) {
            //     this.items.push(item3);
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
        clearInterval(this.__attachCapsuleInterval);
    },
    mounted: function(){
        this.__loadMoreTimeout = setTimeout(()=>{
            this.loadMore();
        }, 500);
    }
}

    
</script>
<style lang="css">


</style>