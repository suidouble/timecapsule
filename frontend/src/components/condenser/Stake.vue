<template>

    <div>
        <q-banner class="bg-primary text-white q-mt-md">
            <q-btn outline size="sm" label="Stake META" target="_blank" color="white" @click="stake" />
        </q-banner>

        <AskAmountDialog ref="askAmountDialog" />
    </div>


</template>
<script>

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
        condenserId: String,
    },
    data() {
        return {
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async stake() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.stake({condenserId: this.condenserId});

                this.$q.notify({
                        spinner: true,
                        message: 'Staked',
                        color: 'positive',
                        timeout: 4000
                    });
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
            const timecapsulesIds = await staking.getOwnedTimecapsulesIds();

            await staking.getExpectedRewardForCapsule({
                timecapsuleId: timecapsulesIds[0],
                condenserId: this.condenserId,
            });
            
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
        }, 500);
    }
}

    
</script>
<style lang="css">


</style>