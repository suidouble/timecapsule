<template>

    <q-dialog square v-model="showing" @hide="onHide" class="round_popup">
        <q-card style="overflow-x: hidden; width: 550px; max-width: 80vw; max-height: 95vh">
            <q-card-section class="q-pb-xs">
                <h6 class="text-h6 q-pb-xs q-mb-xs">{{ coinName }} <span style="font-size: 10px;">{{ note }}</span></h6>

                <q-input outlined v-model="amount" :placeholder="coinName">
                    <template v-slot:prepend>
                        <img v-if="coinIcon" :src="coinIcon" style="width: 26px; height: 26px; border-radius: 13px;" />
                        <span class="text-primary">{{ coinName }}</span> 
                    </template>
                </q-input>

                

                <q-input outlined v-model="flow_interval" label="in period of" class="q-mt-sm">
                </q-input>
                <q-btn size="xs" label="1D" @click="flow_interval = 86400000" />
                <q-btn size="xs" label="1W" @click="flow_interval = 604800000" />
                <q-btn size="xs" label="30D" @click="flow_interval = 2592000000" />


                <div class="text-center">
                    {{ preview }}&nbsp;
                </div>

            </q-card-section>
            <q-card-actions align="center" class="text-primary q-pb-md q-pt-md">

                <q-btn outline square color="white" class="q-mt-md" @click="onOk">Ok</q-btn>

            </q-card-actions>
        </q-card>
    </q-dialog>

</template>
<script>
import { formatCurrency } from 'shared/classes/Format.js';

export default {
	name: 'AskFlowRateDialog',
    components:{
    },
	props: {
	},
	data() {
		return {
            showing: false,
            coinType: null,

            amount: '0',

            coinIcon: null,
            note: '',

            coinName: '',

            flow_amount: '',
            flow_interval: '',

            condenser: null,
        }
	},
	computed: {
        preview() {
            if (!this.flow_amount || !this.flow_interval) {
                return '';
            }

			let diff = (this.flow_interval / 1000);
			let day_diff = Math.floor(diff / 86400);

            return formatCurrency(this.flow_amount, { decimals: this.condenser.localProperties.coin_r._metadata.decimals} ) + ' ' + this.condenser.localProperties.coin_r.symbol + ' per ' + day_diff + ' days';;

        },
    },
	watch: {
        show: function() {
            if (this.show) {
                this.showing = true;
                this.loadCoinInfo();
            }
        },
        amount() {
            this.flow_amount = this.condenser.localProperties.coin_r.normalizeAmount(this.amount);
        },
	},
	methods: {
        async ask(params = {}) {
            if (params.note) {
                this.note = params.note;
            } else {
                this.note = '';
            }

            if (params.flow_amount) {
                this.amount = params.flow_amount;
            }
            if (params.flow_interval) {
                this.flow_interval = params.flow_interval;
            }

            this.condenser = params.condenser;

            this.coinType = params.coinType || 'sui';

            this.__askPromiseResolver = null;
            this.__askPromise = new Promise((res)=>{ this.__askPromiseResolver = res; });
            await this.loadCoinInfo();
            this.showing = true;

            await this.__askPromise;

            let amount = ''+this.amount;
            if (amount.indexOf('.') === -1) {
                amount = amount + '.0';
            }

            return {
                flow_amount: this.flow_amount,
                flow_interval: this.flow_interval,
            };
        },
        onOk() {
            if (this.__askPromiseResolver) {
                this.__askPromiseResolver();
                this.showing = false;
                this.onHide();
            }
        },
        async loadCoinInfo() {
            try {
                this.coinIcon = null;

                const suiCoin = this.$store.sui.suiMaster.suiCoins.get(this.coinType);

                await suiCoin.getMetadata();
                console.error(suiCoin);
                
                this.decimals = suiCoin.metadata.decimals;
                this.coinName = suiCoin.metadata.symbol;
                if (suiCoin.metadata.iconUrl) {
                    this.coinIcon = suiCoin.metadata.iconUrl;
                }

            } catch (e) {
                console.error(e);
            }

            // alert(balance);
        },
        onHide() {
            this.$emit('hide');
        },
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