<template>

    <h5>Setup Localnet</h5>

    <p>On the localnet, we can create a fountain for TEST_COIN-SUI, get SUI rewards from it adding StakeProof 
        to the Kettle boiling SUI for a Condenser&lt;TEST_COIN, SUI> staking TEST_COIN generating SUI as rewards.</p>
    
    <p>While is real-world usage on mainnet, that would be a fountain of&lt;SBUCK, SUI> and 
        Condenser&lt;OTHERCOIN, SUI>, that's ok and supported</p>

    <p>
        <q-btn label="Make a local Fountain" outline @click="makeLocalFountain" />
    </p>

    <p>Last Fountain you have AdminCap for:</p>

    <p style="word-break: break-all;">
        <span v-if="fountain"><ExplorerLink :id="fountain.id" /></span>&nbsp;
        <span v-if="fountain"> with type of:{{fountain._type}}</span></p>

    <p>
        <q-btn label="Supply Fountain with Rewards" outline @click="supplyLocalFountain" />
    </p>

    <p>
        <q-btn label="TEST_COIN faucet" outline @click="testCoinFaucet" />
    </p>

    <p>Make a StakeProof staking 1 TEST_COIN on the last Fountain you have AdminCap for:</p>

    <p>
        <q-btn label="Stake in the fountain" outline @click="stakeTestInYourFountain" />
    </p>

    <AskAmountDialog ref="askAmountDialog" />


</template>
<script>

import ExplorerLink from '../common/ExplorerLink.vue';
import Staking from 'shared/classes/staking/Staking.js';
import AskAmountDialog from '../ask_amount_dialog/AskAmountDialog.vue';

export default {
    name: 'LocalnetSetup',
    components:{
        // DateHuman,
        ExplorerLink,
        AskAmountDialog,
    },
    props: {
    },
    data() {
        return {
            fountain: null,
        }
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async loadMore() {
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            this.fountain = await staking.getFountainYouHaveAdminCapFor();
        },
        async supplyLocalFountain() {
            const amount = await this.$refs.askAmountDialog.ask({
                coinType: '0x2::sui::SUI',
                note: 'Add amount of coin to source',
            });
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                await staking.supplyLocalFountain(amount);
                this.$q.notify({
                        spinner: true,
                        message: 'Supplied',
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
        async testCoinFaucet() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.testCoinFaucet();
                this.$q.notify({
                        spinner: true,
                        message: 'Faucet success',
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
        async makeLocalFountain() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.makeLocalFountain();

                this.$q.notify({
                        spinner: true,
                        message: 'Local fountain created',
                        color: 'positive',
                        timeout: 4000
                    });

                this.loadMore();
            } catch (e) {
                this.$q.notify({
                        message: ''+e,
                        color: 'negative',
                        timeout: 2000
                    });

            }
        },
        async stakeTestInYourFountain() {
            try {
                const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
                await staking.stakeTestInYourFountain();

                this.$q.notify({
                        spinner: true,
                        message: 'Got StakeProof',
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

        }
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