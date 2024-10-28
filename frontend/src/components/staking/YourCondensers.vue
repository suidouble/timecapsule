<template>

    <div>
        <h5>Your Condensers</h5>

        <q-spinner-dots
                v-if="isLoading"
                color="white"
                size="2em"
                />

        <template v-for="(condenser) in condensers" v-bind:key="condenser.id">

            <Condenser :condenser="condenser" 
                :actions="{attach: 'Attach Kettle', release: 'Release Kettle', adjust: 'Adjust Flow Rate', fillsource: 'Fill Rewards Source', boil: 'Boil'}"   
                @attach="(condenser)=>{ idOfCondenserToAttachKettleTo = condenser.id }"
                @release="(condenser)=>{ releaseKettleFromCondenser(condenser.id); }"
                @fillsource="(condenser)=>{ fillSource(condenser); }"
                @adjust="(condenser)=>{ adjust(condenser); }"
                @boil="(condenser)=>{ boilCondenser(condenser); }"
                />

        </template>

        <div v-if="idOfCondenserToAttachKettleTo">

            <p>Select a Kettle <q-btn label="Cancel" size="sm" outline @click="idOfCondenserToAttachKettleTo = null" /></p>

            <template v-for="(kettle) in kettles" v-bind:key="kettle.id">
                <Kettle :kettle="kettle" 
                    :actions="{attach: 'Attach'}" 
                    @attach="(kettle)=>{ attach(kettle.id); }" 
                    />
                    <!-- <q-card class="bg-primary text-white q-mb-xs">
                        <q-card-section>
                            <div class="text-subtitle2">{{item.id}} <ExplorerLink :id="item.id" /> </div>
                            <div class="text-subtitle2">bag size: {{item?.fields?.bag?.fields?.size}} 

                                <q-btn label="Attach Kettle" size="sm" outlined @click="attach(item.id)"  />
                            </div>
                        </q-card-section>
                    </q-card> -->

            </template>

        </div>

        <AskAmountDialog ref="askAmountDialog" />
        <AskFlowRateDialog ref="askFlowRateDialog" />
    </div>


</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import ExplorerLink from '../common/ExplorerLink.vue';
import Condenser from './blocks/Condenser.vue';
import Kettle from './blocks/Kettle.vue';
import AskAmountDialog from '../ask_amount_dialog/AskAmountDialog.vue';
import AskFlowRateDialog from './blocks/AskFlowRateDialog.vue';

export default {
    name: 'YourCondensers',
    components:{
        // DateHuman,
        ExplorerLink,
        Condenser,
        Kettle,
        AskAmountDialog,
        AskFlowRateDialog,
    },
    props: {
    },
    data() {
        return {
            condensers: [],
            kettles: [],

            isLoading: false,

            idOfCondenserToAttachKettleTo: null,
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        type1(condenser) {
            return condenser._type.split('Condenser')[1].split('<').join('').split('>').join('').split(',')[0];
        },
        type2(condenser) {
            return condenser._type.split('Condenser')[1].split('<').join('').split('>').join('').split(',')[1];
        },
        hasKettle(condenser) {
            if (condenser.fields && condenser.fields.kettle) {
                return true;
            }
            return false;
        },
        async adjust(condenser) {
            try {
                const staking = Staking.getSingleton({ suiMaster: this.$store.sui.suiMaster });

                const coinType = condenser.localProperties.type_r;
                const data = await this.$refs.askFlowRateDialog.ask({
                        coinType: coinType,
                        condenser: condenser,
                        flow_amount: condenser.fields.flow_amount,
                        flow_interval: condenser.fields.flow_interval,
                        note: 'Amount of reward coin to be distributed in period:',
                    });
                if (data) {
                    await staking.updateFlowRate(condenser, data.flow_amount, data.flow_interval);
                    this.$q.notify({
                            spinner: true,
                            message: 'Adjusted',
                            color: 'positive',
                            timeout: 4000
                        });
                }
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
        async boilCondenser(condenser) {
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                await staking.boilCondenser(condenser.id);
                this.$q.notify({
                        spinner: true,
                        message: 'Boiled',
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
        async fillSource(condenser) {
            const coinType = condenser._type.split('Condenser')[1].split('<').join('').split('>').join('').split(',')[1].trim();

            const amount = await this.$refs.askAmountDialog.ask({
                coinType: coinType,
                note: 'Add amount of coin to source',
            });
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                await staking.supplyCondenser(condenser.id, amount);
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
        async releaseKettleFromCondenser(condenserId) {
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                await staking.releaseKettleFromCondenser(condenserId);
                this.$q.notify({
                        spinner: true,
                        message: 'Released',
                        color: 'positive',
                        timeout: 4000
                    });
                await new Promise((res)=>setTimeout(res, 2000));
                this.idOfCondenserToAttachKettleTo = null;
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
        async attach(kettleId) {
            const condenserId = this.idOfCondenserToAttachKettleTo;
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                await staking.attachKettleToCondenser(kettleId, condenserId);
                this.$q.notify({
                        spinner: true,
                        message: 'Attached',
                        color: 'positive',
                        timeout: 4000
                    });
                await new Promise((res)=>setTimeout(res, 2000));
                this.idOfCondenserToAttachKettleTo = null;
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
            this.items = [];
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            
            try {
                this.condensers = await staking.getYourCondensers();
                this.kettles = await staking.getYourKettles();
            } catch (e) {
                console.error(e);
            }
            console.log('this.condensers', this.condensers);

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
        }, 50);
    }
}

    
</script>
<style lang="css">


</style>