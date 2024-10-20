<template>

    <q-card class="bg-primary text-white q-mb-xs">
        <q-card-section>

            <q-markup-table separator="none" flat bordered style="background-color: transparent;">
                        <tbody>
                            <tr>
                                <td class="text-left">Condenser</td>
                                <td class="text-left"> <ExplorerLink :id="condenser.id" />
                                </td>
                            </tr>
                            <tr>
                                <td class="text-left">&nbsp;</td>
                                <td class="text-left"> 
                                    <q-btn :href="'/condenser/'+condenser.id" label="page"  size="sm" outline target="_blank"  color="white" icon="link" />   
                                </td>
                            </tr>
                            <tr>
                                <td class="text-left">Staking</td>
                                <td class="text-left"> {{type1(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Source</td>
                                <td class="text-left"> {{sourceAmount(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Pool</td>
                                <td class="text-left"> {{poolAmount(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Rewards</td>
                                <td class="text-left">  {{type2(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Flow Amount</td>
                                <td class="text-left"> {{flowAmount(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Flow Interval</td>
                                <td class="text-left"> {{flowInterval(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Kettle</td>
                                <td class="text-left"> {{kettleYesNo(condenser)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">&nbsp;</td>
                                <td class="text-left">

                                    <template v-for="(value, key) in actions" v-bind:key="key">
                                        <q-btn :label="value" size="sm" outline  @click="$emit(key, condenser)"  />
                                    </template>

                                </td>
                            </tr>
                        </tbody>
            </q-markup-table>


        </q-card-section>
    </q-card>

</template>
<script>
import ExplorerLink from '../../common/ExplorerLink.vue';

export default {
    name: 'Condenser',
    components:{
        // DateHuman,
        ExplorerLink,
    },
    props: {
        condenser: Object,   
        actions: Object,       
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
        sourceAmount(condenser) {
            return condenser.fields.source;
        },
        poolAmount(condenser) {
            return condenser.fields.pool;
        },
        flowAmount(condenser) {
            return condenser.fields.flow_amount;
        },
        flowInterval(condenser) {
            return condenser.fields.flow_interval;
        },
        kettleYesNo(condenser) {
            if (condenser.fields && condenser.fields.kettle) {
                return 'yes';
            }
            return 'no';
        },
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
    },
    computed: {
    },
    unmounted: function() {
    },
    mounted: function(){
    }
}

    
</script>
<style lang="css">


</style>