<template>

    <div class="row">
        <div class="col-lg-2 col-12">
        &nbsp;
        </div>
        <div class="col-lg-8 col-12">

            <div style="margin: 0 auto; width: 400px;">
                <div style="position: fixed; top: 50vh">
                    <div style="margin-top: -200px;">

                        <ParticleClocks2 @clockclick="onClockClick" />

                    </div>
                </div>
            </div>

            <MintTimeCapsuleDialog :show="showMintPopup" @hide="showMintPopup = false;" />

        </div>
        <div class="col-lg-2 col-12">

            <div style="height: 60vh;" class="lt-lg"></div>
            <ListTimecapsules />

        </div>
    </div>
<!-- 

    <div>
        Homepage

        <ParticleClocks2  />
        <q-btn color="primary" @click="onClick" > test </q-btn>
        <q-btn color="primary" @click="showRoundSignaturePopup = true" > Round Signatures </q-btn>
        <MintTimeCapsuleDialog :show="showMintPopup" @hide="showMintPopup = false;" />

        <RoundSignatureDialog :show="showRoundSignaturePopup" @hide="showRoundSignaturePopup = false;" />
    </div> -->

</template>

<script>
import MintTimeCapsuleDialog from '../components/mint/MintTimeCapsuleDialog.vue';
// import RoundSignatureDialog from '../components/mint/RoundSignatureDialog.vue';
import ParticleClocks2 from 'shared/components/ParticleClocks/ParticleClocks2.vue';

import ListTimecapsules from '../components/timecapsule/ListTimecapsules.vue';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        ParticleClocks2,
        MintTimeCapsuleDialog,
        ListTimecapsules,
        // RoundSignatureDialog,
    },
	data() {
		return {
            chain: 'sui:mainnet',

            showMintPopup: false,
            showRoundSignaturePopup: false,
		}
	},
    watch: {
    },
	methods: {
        onClockClick() {
            if (!this.isConnected) {
                this.$store.sui.request();
            } else {
                this.showMintPopup = true;
            }
        },
        onClick() {
            this.showMintPopup = true;
        },
        async switchTo(chainName) {
            this.chain = null;
            await new Promise((res)=>setTimeout(res, 500));
            this.chain = chainName;
        }
	},
    computed: {
        isConnected: function() {
            return this.$store.sui.address;
        },
    },
    beforeMount() {
    },
    mounted() {
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    h5 {
        margin: 0 0 16px 0;
    }

    .active_one {
        font-weight: bold;
    }


</style>

