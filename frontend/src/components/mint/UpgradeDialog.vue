<template>

    <q-dialog square v-model="showing" @hide="onHide" class="round_popup">
        <q-card style="overflow-x: hidden; width: 550px; max-width: 80vw; max-height: 95vh">
            <q-card-section class="q-pb-xs">
                <h6 class="text-h6 q-pb-xs q-mb-xs">{{ coinName }} <span style="font-size: 10px;">0.1 SUI + 0.5% to be taken as fee</span></h6>

                <q-input outlined v-model="amount" :placeholder="coinName">
                    <template v-slot:prepend>
                        <q-icon name="water_drop" color="primary" /><span class="text-primary">{{ coinName }}</span> 
                    </template>
                </q-input>
                <div class="">
                    <q-slider switch-label-side v-model="amountPercent" :min="0" :max="100" label-always  label :label-value="amountPercent + '%'"  />
                </div>

            </q-card-section>
            <q-card-actions align="center" class="text-primary q-pb-md q-pt-md">

                <q-btn outline square color="white" class="q-mt-md" @click="onOk">Ok</q-btn>

            </q-card-actions>
        </q-card>
    </q-dialog>

</template>
<script>

export default {
	name: 'UpgradeDialog',
    components:{
    },
	props: {
        show: {
            type: Boolean,
            default: false,
        },
        timecapuse: {
            type: Object,
            default: null,
        },
	},
	data() {
		return {
            showing: false,

            amount: '0',
            availableAmount: '0',
            amountPercent: 10,

            decimals: 0,
            coinName: '',
        }
	},
	watch: {
        show: function() {
            if (this.show) {
                this.showing = true;
                this.loadCoinInfo();
            }
        },
        amountPercent() {
            if (this.__ignoreAmount && ( new Date() ).getTime() - this.__ignoreAmount.getTime() < 100) {

                this.__ignoreAmount = null;

            }  else {

                this.__ignoreAmount = new Date();
                this.amount = ''+(parseFloat(this.availableAmount, 10) * this.amountPercent / 100).toFixed(this.decimals); 
                if (parseFloat(this.amount, 10) > parseFloat(this.availableAmount, 10)) {
                    this.amount = this.availableAmount;
                }
            
            }
        },
        amount() {
            if (this.__ignoreAmount && ( new Date() ).getTime() - this.__ignoreAmount.getTime() < 100) {

                this.__ignoreAmount = null;

            }  else {

                this.__ignoreAmount = new Date();
                if (!this.amount) {
                    this.amount = '1.0';
                }
                if (parseFloat(this.amount, 10) > parseFloat(this.availableAmount, 10)) {
                    this.amount = this.availableAmount;
                }
                if (parseFloat(this.amount, 10) < 0) {
                    this.amount = '0.0';
                }

                this.amountPercent = Math.floor( (parseFloat(this.amount) / parseFloat(this.availableAmount, 10)) * 100 );

            }
        },
	},
	methods: {
        async ask() {
            this.__askPromiseResolver = null;
            this.__askPromise = new Promise((res)=>{ this.__askPromiseResolver = res; });
            await this.loadCoinInfo();
            await this.__askPromise;

            return this.amount;
        },
        onOk() {
            if (this.__askPromiseResolver) {
                this.__askPromiseResolver();
                this.showing = false;
                this.onHide();
            }
        },
        async loadCoinInfo() {
			const suiCoin = this.$store.sui.suiMaster.suiCoins.get('sui');
            this.decimals = suiCoin.metadata.decimals;
            this.coinName = suiCoin.metadata.symbol;

            console.error(suiCoin);
			await suiCoin.getMetadata();
            const balance = await this.$store.sui.suiMaster.getBalance('sui');
            this.availableAmount = suiCoin.amountToString(balance);
            this.amount = ''+(this.availableAmount * this.amountPercent / 100).toFixed(this.decimals);

            // alert(balance);
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
            this.loadCoinInfo();
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