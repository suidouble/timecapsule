<template>

    <h5>TimeCapsule Admin</h5>

    <div>
        <q-input v-model="coinType" placeholder="Coin Type" hint="Coin Type" />
    </div>

    <p>
        <q-btn label="Claim Fees" outline @click="claimFees" />
    </p>


</template>
<script>


export default {
    name: 'TimeCapsuleAdmin',
    components:{
        // DateHuman,
    },
    props: {
    },
    data() {
        return {
            coinType: '',
        }
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async claimFees() {

            await this.$store.sui.timeCapsuleContract.collectFees(this.coinType);

        },
    },
    computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
    },
    unmounted: function() {
        // clearTimeout(this.__loadMoreTimeout);
    },
    mounted: function(){
        // this.__loadMoreTimeout = setTimeout(()=>{
        //     this.loadMore();
        // }, 1000);
    }
}

    
</script>
<style lang="css">


</style>