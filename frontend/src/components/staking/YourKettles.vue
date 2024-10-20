<template>

    <h5>Your Kettles</h5>


    <q-spinner-dots
            v-if="isLoading"
            color="white"
            size="2em"
            />

    <div v-if="!idOfKettleToAttachProofTo">
        <p>Kettles owned by you and not attached to any Condenser</p>

        <template v-for="(item) in items" v-bind:key="item.id">
            <Kettle :kettle="item" 
                :actions="{attach: 'Attach StakeProof', release: 'Release StakeProof'}"     
                @attach="(kettle)=>{ idOfKettleToAttachProofTo = kettle.id }" 
                @release="(kettle)=>{ releaseStakeProof(kettle.id); }" 
                />

<!--             
            <q-card class="bg-primary text-white q-mb-xs">
                <q-card-section>
                    <q-markup-table separator="none" flat bordered style="background-color: transparent;">
                        <tbody>
                            <tr>
                                <td class="text-left">Kettle</td>
                                <td class="text-left"><ExplorerLink :id="item.id" /></td>
                            </tr>
                            <tr>
                                <td class="text-left">Bag</td>
                                <td class="text-left"> {{item?.fields?.bag?.fields?.size}}  </td>
                            </tr>
                            <tr>
                                <td class="text-left">&nbsp;</td>
                                <td class="text-left">

                                    <q-btn label="Attach StakeProof" size="sm" outline @click="idOfKettleToAttachProofTo = item.id" />
                                    <q-btn label="Release StakeProof" size="sm" outline @click="releaseStakeProof(item.id)" />

                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>


                </q-card-section>
            </q-card> -->

        </template>

    </div>

    <div v-if="idOfKettleToAttachProofTo">

        <p>Select a StakeProof <q-btn label="Cancel" size="sm" outline @click="idOfKettleToAttachProofTo = null" /></p>

        <template v-for="(proof) in bucketProofs" v-bind:key="proof.id">
            <q-card class="bg-primary text-white q-mb-xs">
                <q-card-section>




                    <q-markup-table separator="none" flat bordered style="background-color: transparent;">
                        <tbody>
                            <tr>
                                <td class="text-left">Stake Proof</td>
                                <td class="text-left"> <ExplorerLink :id="proof.id" /> </td>
                            </tr>
                            <tr>
                                <td class="text-left">Staked</td>
                                <td class="text-left"> {{amountToString(proof.fields.stake_amount)}} {{proofType1(proof)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">Rewards</td>
                                <td class="text-left">  {{proofType2(proof)}} </td>
                            </tr>
                            <tr>
                                <td class="text-left">&nbsp;</td>
                                <td class="text-left">

                                    <q-btn label="Attach StakeProof" size="sm" outline @click="attach(proof.id)" />

                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>


                </q-card-section>
            </q-card>

        </template>

    </div>

</template>
<script>

import Staking from 'shared/classes/staking/Staking.js';
import ExplorerLink from '../common/ExplorerLink.vue';
import Kettle from './blocks/Kettle.vue';

export default {
    name: 'YourKettles',
    components:{
        // DateHuman,
        ExplorerLink,
        Kettle,
    },
    props: {
    },
    data() {
        return {
            items: [],
            bucketProofs: [],
            isLoading: false,
        
            idOfKettleToAttachProofTo: null,
        };
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async releaseStakeProof(kettleId) {
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                this._coin = await staking.releaseStakeProofFromKettle(kettleId);
                this.$q.notify({
                        spinner: true,
                        message: 'Released',
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
        async attach(proofId) {
            const kettleId = this.idOfKettleToAttachProofTo;
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            try {
                this._coin = await staking.attachStakeProofToKettle(kettleId, proofId);
                this.$q.notify({
                        spinner: true,
                        message: 'Attached',
                        color: 'positive',
                        timeout: 4000
                    });
                await new Promise((res)=>setTimeout(res, 2000));
                this.idOfKettleToAttachProofTo = null;
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
        proofType1(proof) {
            return proof._type.split('Proof')[1].split('<').join('').split('>').join('').split(',')[0];
        },
        proofType2(proof) {
            return proof._type.split('Proof')[1].split('<').join('').split('>').join('').split(',')[1];
        },
        amountToString(value) {
            return this._coin.amountToString(value);
        },
        async loadMore() {
            this.isLoading = true;
            this.items = [];
            const staking = new Staking({ suiMaster: this.$store.sui.suiMaster });
            this._coin = await staking.getSBuckCoin();
            
            try {
                this.items = await staking.getYourKettles();
            } catch (e) {
                console.error(e);
            }
            console.log('this.items', this.items);

            this.bucketProofs = await staking.getYourBucketProofs();
            console.log('bucketProofs', this.bucketProofs);

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