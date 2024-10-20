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
                :actions="{attach: 'Attach Kettle', release: 'Release Kettle', fillsource: 'Fill Source', boil: 'Boil'}"   
                @attach="(condenser)=>{ idOfCondenserToAttachKettleTo = condenser.id }"
                @release="(condenser)=>{ releaseKettleFromCondenser(condenser.id); }"
                @fillsource="(condenser)=>{ fillSource(condenser); }"
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
    </div>


</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import ExplorerLink from '../common/ExplorerLink.vue';
import Condenser from './blocks/Condenser.vue';
import Kettle from './blocks/Kettle.vue';
import AskAmountDialog from '../ask_amount_dialog/AskAmountDialog.vue';

export default {
    name: 'YourCondensers',
    components:{
        // DateHuman,
        ExplorerLink,
        Condenser,
        Kettle,
        AskAmountDialog,
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