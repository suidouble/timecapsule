<template>

    <div style="background: black;">
    <div class="row" style="background: black;">
        <div class="col-2">
        &nbsp;
        </div>
        <div class="col-8">

            <div style="margin: 0 auto; width: 400px;">
                <div style="position: fixed; top: 50vh">
                    <div style="margin-top: -200px;">

                        <ParticleClocks2 :text="textOnClock" />

                    </div>
                </div>
            </div>


        </div>
        <div class="col-2">

            <q-btn outline square color="primary" label="Collect" @click="collect" />

            <q-btn outline square color="primary" label="Ask" @click="ask" />

            <AskAmountDialog ref="askAmountDialog" />

        </div>
    </div>

    <div style="clear: both;"></div>
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
import ParticleClocks2 from 'shared/components/ParticleClocks/ParticleClocks2.vue';
import AskAmountDialog from '../components/ask_amount_dialog/AskAmountDialog.vue';

export default {
	name: 'test',
    path: '/test',
	props: {
	},
    components: {
        ParticleClocks2,
        AskAmountDialog,
    },
	data() {
		return {
            chain: 'sui:mainnet',
            textOnClock: ' ',
		}
	},
    watch: {
    },
	methods: {
        async ask() {
            const amount = await this.$refs.askAmountDialog.ask({
                coinType: '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
                // coinType: '0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD',
            });
            alert(amount);
        },
        async collect() {
            await this.$store.sui.timeCapsuleContract.collectFees();
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
        setTimeout(()=>{ this.textOnClock = 'sui' }, 2000);
        setTimeout(()=>{ this.textOnClock = 'overflow' }, 4000);
        setTimeout(()=>{ this.textOnClock = ' ' }, 4100);
        setTimeout(()=>{ this.textOnClock = 'overflow' }, 4300);
        setTimeout(()=>{ this.textOnClock = 'randomness' }, 6500);
        setTimeout(()=>{ this.textOnClock = 'random ' }, 6700);
        setTimeout(()=>{ this.textOnClock = 'randomness' }, 6900);
        setTimeout(()=>{ this.textOnClock = 'hex.capsule' }, 8500);
        setTimeout(()=>{ this.textOnClock = 'CAPSULE' }, 10200);
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

