<template>

<div>
    <div v-if="!timecapsule" class="q-pa-xl">
        <q-spinner-clock
          color="white"
          size="2em"
        />
    </div>
    <div v-if="timecapsule">
    <q-card flat square>
      <q-card-section>
        <table>
            <tr>
                <td>id</td>
                <td>{{timecapsule.longDisplayId}}
                    <q-btn :href="timecapsule.urlOnExplorer"  flat size="xs" round target="_blank"  color="primary" icon="link" />
                </td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>Owner</td>
                <td>{{timecapsule.longDisplayOwnerAddress}} <span v-if="timecapsule.ownedByYou">(you)</span>
                    <q-btn :href="timecapsule.ownerUrlOnExplorer"  flat size="xs" round target="_blank"  color="primary" icon="link" />
                </td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>state</td>
                <td>
                    <span v-if="timecapsule.decrypted">Decrypted</span>
                    <span v-if="!timecapsule.decrypted">Encrypted</span>
                </td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>target&nbsp;round</td>
                <td>{{timecapsule.forRound}} 
                    <q-btn :href="timecapsule.urlOfRoundAPI"  flat size="xs" round target="_blank"  color="primary" icon="link" />
                </td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>current&nbsp;round</td>
                <td>{{ currentDrandRound }}</td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>target&nbsp;time</td>
                <td> <DateHuman :value="timecapsule.mayBeDecryptedAtAsDate" /> </td>
            </tr>
        </table>
    </q-card-section>
    </q-card>
    </div>
</div>

</template>
<script>
import DateHuman from 'shared/components/Helpers/DateHuman.vue';

export default {
	name: 'TimecapsuleInfo',
    components:{
        DateHuman,
    },
	props: {
        timecapsule: {
            type: Object,
        }
	},
	data() {
		return {
		}
	},
	watch: {
	},
	methods: {
	},
	computed: {
        currentDrandRound: function() {
            return this.$store.sui.drandRound;
        },
	},
	unmounted: function() {
	},
	mounted: function(){
	}
}
</script>
<style lang="css">


</style>