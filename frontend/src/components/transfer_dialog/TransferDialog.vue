<template>

    <q-dialog square v-model="showing" @hide="onHide" class="round_popup">
        <q-card style="overflow-x: hidden; width: 550px; max-width: 80vw; max-height: 95vh">
            <q-card-section class="q-pb-xs">
                <h6 class="text-h6 q-pb-xs q-mb-xs">Transfer object</h6>
                <p class="q-pb-xs q-mb-xs">{{objectId}} </p>
                <p class="q-pb-xs q-mb-xs">to: <span style="font-size: 10px;">{{ note }}</span></p>

                <q-input outlined v-model="to" placeholder="0x">
                </q-input>

            </q-card-section>
            <q-card-actions align="center" class="text-primary q-pb-md q-pt-md">

                <q-btn outline square color="white" class="q-mt-md" @click="onOk">Transfer</q-btn>

            </q-card-actions>
        </q-card>
    </q-dialog>

</template>
<script>

export default {
	name: 'TransferDialog',
    components:{
    },
	props: {
	},
	data() {
		return {
            showing: false,
            objectId: null,
            to: null,
        }
	},
	watch: {
        show: function() {
            if (this.show) {
                this.showing = true;
            }
        },
	},
	methods: {
        async ask(params = {}) {
            this.to = null;

            if (params.note) {
                this.note = params.note;
            } else {
                this.note = '';
            }

            this.objectId = params.objectId;

            this.__askPromiseResolver = null;
            this.__askPromise = new Promise((res)=>{ this.__askPromiseResolver = res; });

            this.showing = true;

            await this.__askPromise;
        },
        async onOk() {
            const suiMaster = this.$store.sui.suiMaster;
            const tx = new suiMaster.Transaction;
            tx.transferObjects([tx.object(this.objectId)], this.to);

            let success = false;

            try {
                const r = await suiMaster.signAndExecuteTransaction({ 
                        transaction: tx, 
                        requestType: 'WaitForLocalExecution',
                        sender: suiMaster.address, 
                        options: {
                            "showEffects": true,
                        },
                    });
                if (r && r.effects && r.effects.status && r.effects.status.status && r.effects.status.status == 'success') {
                    success = true;
                }
            } catch (e) {
                console.error(e);
            }


            if (this.__askPromiseResolver) {
                this.__askPromiseResolver();
                this.showing = false;
                this.onHide();
            }
        },
        onHide() {
            this.$emit('hide');
        },
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
        text-align: left;
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