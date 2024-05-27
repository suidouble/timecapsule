<template>

    <q-dialog square v-model="showing" @hide="onHide" class="mint_popup">
        <q-card style="overflow-x: hidden; width: 950px; max-width: 80vw; max-height: 95vh">
            <!-- <q-scroll-area style="height: 85vh;"> -->
            <q-card-section class="q-pb-xs" v-if="!isConnected">

                <q-btn unelevated color="primary" label="Connect" size="md" @click="doConnect" :loading="isLoading" />

            </q-card-section>
            <q-card-section class="q-pb-xs">

                <h6 class="text-h6 q-pb-xs q-mb-xs">Target Time</h6>

                <div class="row q-col-gutter-md">
                    <div class="col-12 col-lg-6">
                        <q-date :options="dateOptionsFn" flat square bordered v-model="time" mask="YYYY-MM-DD HH:mm" color="primary" landscape  format="YYYY-MM-DD HH:mm:ss" />
                    </div>
                    <div class="col-12 col-lg-6">
                        <q-time :options="timeOptionsFn" ref="dateSelect" now-btn flat square bordered v-model="time" format24h mask="YYYY-MM-DD HH:mm" color="primary" landscape  format="YYYY-MM-DD HH:mm:ss"  />
                    </div>
                </div>


                <div class="q-pt-sm" v-if="targetDrandRound">Target drand round: {{ targetDrandRound }}  {{ timeAsPretty  }}  </div>
                <div class="q-pt-sm" v-if="!targetDrandRound">&nbsp;</div>

            </q-card-section>
            <q-card-section class="q-pb-xs">

                <div class="row q-col-gutter-md">
                    <div class="col-12 col-lg-6">
                        <h6 class="text-h6 q-pb-xs q-mb-xs">Attach Message</h6>

                        <q-input outlined v-model="message" placeholder="Secret"></q-input>
                    </div>
                    <div class="col-12 col-lg-6">
                        <h6 class="text-h6 q-pb-xs q-mb-xs">Attach Sui</h6>


                        <q-input outlined v-model="amount" placeholder="Sui">
                        <template v-slot:prepend>
                        <q-icon name="water_drop" color="primary" /><span class="text-primary">SUI</span> 
                        </template>
                        </q-input>
                        <div class="">
                        <q-slider switch-label-side v-model="amountPercent" :min="0" :max="100" label-always  label :label-value="amountPercent + '%'"  />
                        </div>
                    </div>
                </div>

            </q-card-section>
            <q-card-section class="q-pb-xs q-pt-xs q-mt-xs" style="max-width: 950px; overflow: hidden;">
                    <Transition name="fade">
                    <div v-if="messageEncryptedHex" class="text-weight-thin  q-pt-sm" style="max-width: 70vw; overflow-wrap: break-word;">
                        <h6 class="text-h6 q-pb-xs q-mb-xs">Time Capsule Cipher</h6>
                        {{ messageEncryptedHex }}
                    </div>
                    </Transition>
            </q-card-section>
            <q-card-actions align="center" class="text-primary q-pb-md q-pt-md">
                <q-btn :disable="!canMint" unelevated color="white" outline label="Mint Time Capsule" size="md" @click="doMint" :loading="isLoading" />
            </q-card-actions>
            <!-- </q-scroll-area> -->
        </q-card>
    </q-dialog>

</template>
<script>

export default {
	name: 'MintTimeCapsuleDialog',
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
            amount: '10.00',
            isLoading: false,

            availableAmount: 1,
            amountPercent: 10,

            message: '',
            messageEncrypted: null,
            messageEncryptedHex: null,
            messageEncryptionPending: false,

            time: null,
            timeAsDate: null,
            timeAsPretty: null,

            targetDrandRound: null,
		}
	},
	watch: {
        ownedSuiAmount: function() {
            this.availableAmount = this.$store.sui.amount_sui_string;
            this.amount = ''+(this.availableAmount * this.amountPercent / 100).toFixed(2);
        },
        time: function() {
            this.timeAsDate = new Date(this.time);
            this.timeAsDate.setSeconds(59);

            if (this.$store.sui.drandEncryptor) {
                this.targetDrandRound = this.$store.sui.drandEncryptor.roundAt(this.timeAsDate.getTime());
                this.timeAsPretty = this.prettyFutureDate(this.timeAsDate);
            }
            // this.targetDrandRound = this.$store.sui.drandEncryptor.roundAt

            this.encryptMessageDebounce();
        },
        message: function() {
            this.encryptMessageDebounce();
        },
        connectionId: function() {
        },
        show: function() {
            if (this.show) {
                this.showing = true;
                setTimeout(()=>{
                    this.$refs.dateSelect.setNow();
                }, 200);
                this.availableAmount = this.$store.sui.amount_sui_string;
                this.amount = ''+(this.availableAmount * this.amountPercent / 100).toFixed(2);
            }
        },
        amountPercent() {
            if (this.__ignoreAmount && ( new Date() ).getTime() - this.__ignoreAmount.getTime() < 100) {

                this.__ignoreAmount = null;

            }  else {

                this.__ignoreAmount = new Date();
                this.amount = ''+(parseFloat(this.availableAmount, 10) * this.amountPercent / 100).toFixed(3); 
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
        async doConnect() {
            this.isLoading = true;
            this.$store.sui.request();
            this.isLoading = false;
        },
		dateOptionsFn(date) {
            const minDate = new Date();
            minDate.setHours(0,0,0,0);
            const checkDate = new Date(date);

			if (checkDate < minDate) {
				return false;
			}

			return true;
		},
        timeOptionsFn(hr, min) {
            const curDate = new Date();
            let timeCopy = new Date();
            if (this.timeAsDate) {
                timeCopy = new Date(this.timeAsDate.getTime());
            }

            if (min === null) {
                timeCopy.setHours(hr, 59);
            } else {
                timeCopy.setHours(hr, min);
            }

            if (curDate > timeCopy) {
                return false;
            }

            return true;
        },
		prettyFutureDate(date) {
			let normalizedDate = null;
			if (date instanceof Date) {
				normalizedDate = date;
				// ok
			} else {
				normalizedDate = new Date(date);
			}
            let now_time = ((new Date()).getTime());
            let date_time = normalizedDate.getTime();

            if (date_time < now_time) {
                return 'in the past';
            }

			let diff = (date_time - now_time) / 1000;
            if (diff < 60) {
                return 'in few seconds';
            }
            if (diff < 120) {
                return 'in a minute';
            }
            if (diff < 3600) {
                return 'in '+Math.floor(diff / 60)+' minutes';
            }

			let day_diff = Math.floor(diff / 86400);

			let str_diff = day_diff == 0 && (
				diff < 60 && "few seconds" || diff < 120 && "a minute" || diff < 3600 && Math.floor(diff / 60) + " minutes" || diff < 7200 && "1 hour" || diff < 86400 && Math.floor(diff / 3600) + " hours") || day_diff == 1 && "tomorrow" || day_diff < 7 && day_diff + " days" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks" || day_diff < 60 && "a month" || (Math.ceil(day_diff / 30) + " months");
		
            return 'in '+str_diff;
        },
        encryptMessageDebounce() {
            this.messageEncryptionPending = true;

            clearTimeout(this.__encryptMessageDebounceTimeout);
            this.__encryptMessageDebounceTimeout = setTimeout(()=>{
                this.encryptMessage();
            }, 500);
        },
        encryptMessage() {
            if (this.targetDrandRound) {
                this.messageEncrypted = this.$store.sui.drandEncryptor.encryptMessageForRound(this.message, this.targetDrandRound);
                this.messageEncryptedHex = this.$store.sui.drandEncryptor.uint8ArrayToHexString(this.messageEncrypted);
                this.messageEncryptionPending = false;
            } 
        },

        async doMint() {
            this.isLoading = true;

            const timecapsuleId = await this.$store.sui.timeCapsuleContract.mint({
                messageEncrypted: this.messageEncrypted,
                targetDrandRound: this.targetDrandRound,
                sui: this.amount,
            });

            if (timecapsuleId) {
                this.$q.notify({
                    spinner: true,
                    message: 'Time Capsule minted. Wait a second, we are going to redirect you',
                    timeout: 2000
                });
                await new Promise((res)=>setTimeout(res, 2000));
                this.$router.push('/capsule/'+timecapsuleId);
            } else {
                this.$q.notify({
                    message: 'Error minting',
                    timeout: 2000
                });
            }

            this.isLoading = false;

            // const success = await this.$store.sui.timeCapsuleContract.mint({
            //     messageEncrypted: this.messageEncryptedHex,
            //     targetDrandRound: this.targetDrandRound,
            // });

            this.onHide();
        },
        onHide() {
            this.time = null;
            this.$emit('hide');
        },
	},
	computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        isConnected: function() {
            return this.$store.sui.address;
        },
        ownedSuiAmount: function() {
            return this.$store.sui.amount_sui_string;
        },
        canMint: function() {
            return (!this.messageEncryptionPending && this.messageEncrypted);
        },
	},
	unmounted: function() {
	},
	mounted: function(){
        if (this.show) {
            this.showing = true;
            setTimeout(()=>{
                this.$refs.dateSelect.setNow();
            }, 200);
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


.mint_popup .q-date__header {
    height: 290px;
}

.mint_popup .q-time__header {
    height: 290px;
}

.mint_popup .q-field__native {
        text-align: right;
        color: var(--text-color) !important;
        font-weight: bold !important;
        font-size: 20px !important;
}

.mint_popup .q-field__control .text-primary {
    font-size: 16px;
}

.mint_popup .q-btn {
    text-transform: none;
}


</style>