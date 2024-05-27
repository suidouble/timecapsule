<template>

    <q-dialog square v-model="showing" @hide="onHide" class="round_popup">
        <q-card style="overflow-x: hidden; width: 950px; max-width: 80vw; max-height: 95vh">
            <q-card-section class="q-pb-xs">

                <q-input outlined v-model="round" placeholder="Round"></q-input>

            </q-card-section>
            <q-card-section class="q-pb-xs">
                <Transition name="fade">
                <div v-if="roundSignature" class="text-weight-thin  q-pt-sm" style="width: 900px; overflow-wrap: break-word;">
                    <h6 class="text-h6 q-pb-xs q-mb-xs">Round Signature</h6>
                    {{ roundSignature }}
                </div>
                </Transition>
            </q-card-section>
            <q-card-actions align="center" class="text-primary q-pb-md q-pt-md">


            </q-card-actions>
        </q-card>
    </q-dialog>

</template>
<script>

export default {
	name: 'RoundSignatureDialog',
    components:{
    },
	props: {
        show: {
            type: Boolean,
            default: false,
        }
	},
	data() {
		return {
            showing: false,

            round: null,
            roundSignature: null,
            isLoading: false,
		}
	},
	watch: {
        show: function() {
            if (this.show) {
                this.showing = true;
            }
        },
        round: function() {
            clearTimeout(this.__getSignatureTimeout);
            this.__getSignatureTimeout = setTimeout(()=>{
                this.getSignature();
            }, 500);
        },
	},
	methods: {
        onHide() {
            this.$emit('hide');
        },
        async getSignature() {
            this.isLoading = true;
            const drandRounds = this.$store.sui.getDrandRounds();
            let signature = await drandRounds.getSignature(this.round);
            if (!signature) {
                signature = 'not found (yet?)';
            }

            this.roundSignature = signature;
            this.isLoading = false;
        }
	},
	computed: {
	},
	unmounted: function() {
	},
	mounted: function(){
        if (this.show) {
            this.showing = true;
        }
	}
}
</script>
<style lang="css">

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
  transform-origin: left top;
  transform: scaleY(1);
  line-height: 1.5;
}

.fade-enter-from,
.fade-leave-to {
  transform: scaleY(0);
  line-height: 0;
  opacity: 0;
}



.round_popup .q-field__native {
        text-align: right;
        color: var(--text-color) !important;
        font-weight: bold !important;
        font-size: 20px !important;
}

.round_popup .q-field__control .text-primary {
    font-size: 16px;
}

.round_popup .q-btn {
    text-transform: none;
}


</style>