<template>

    <h5>Add Kettle</h5>

    <p>Kettle is the special type of Sui object generating rewards</p>

    <q-btn label="Make new empty Kettle" outline @click="make" />

</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';

export default {
    name: 'AddKettle',
    components:{
        // DateHuman,
    },
    props: {
    },
    data() {
        return {
        }
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
                await staking.makeKettle();

                this.$q.notify({
                        spinner: true,
                        message: 'Kettle created',
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