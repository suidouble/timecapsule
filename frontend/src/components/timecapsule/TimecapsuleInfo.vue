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
            <tr v-if="!timecapsule.is404">
                <td valign="top">contents</td>
                <td>
                    secret message<br/>
                    <img src="/sui.png" style="width: 20px; height: 20px; border-radius: 10px; vertical-align: middle;"/>&nbsp;{{contentSuiAmountAsString}}  <br/>
                    <span v-if="fudAmountAsString && fudAmountAsString != '0'">FUD:&nbsp;&nbsp;{{fudAmountAsString}}<br/></span>  
                    <span v-if="buckAmountAsString && buckAmountAsString != '0'">
                        <img src="/buck.svg" style="width: 20px; height: 20px; border-radius: 10px; vertical-align: middle;"/>&nbsp;{{buckAmountAsString}}<br/></span>  
                    <span v-if="stakedBuckAmountAsString && stakedBuckAmountAsString != '0'" >
                        <img src="/sbuck.png" style="width: 20px; height: 20px; border-radius: 10px; vertical-align: middle;"/>&nbsp;{{stakedBuckAmountAsString}}<br/></span> 
                    <span v-if="stakedBuckRewardsAsString && stakedBuckRewardsAsString != '0'" >
                        <img src="/sui.png" style="width: 20px; height: 20px; border-radius: 10px; vertical-align: middle;"/>&nbsp;{{stakedBuckRewardsAsString}}<br/></span>  
                
                    
                    
                </td>
            </tr>
            <tr v-if="!timecapsule.is404">
                <td>level</td>
                <td>
                    <span v-if="timecapsule.level == 0">basic</span>
                    <span v-if="timecapsule.level == 1" style="color: #f5c98c; line-height: 25px; vertical-align: middle;">
                        <q-icon name="star_rate" size="25px" color="#f5c98c" />gold
                    </span>
                    <span v-if="timecapsule.level > 1" style="color: #8ce5f5; line-height: 25px; vertical-align: middle;">
                        <q-icon name="star_rate" size="25px" color="#8ce5f5" />sui-per
                    </span>
                </td>
            </tr>
        </table>

        <AskAmountDialog ref="askAmountDialog" />

        <q-btn outline square color="white" @click="attachBuck" v-if="canUpgradeWithBuck" class="q-mt-md">
            <div style="padding: 0; line-height: 30px;">
                <img src="/buck.svg" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>
                Upgrade with Bucket USD
            </div>
        </q-btn>

        <q-btn outline square color="white" @click="attachFud" v-if="canUpgradeWithFud" class="q-mt-md">
            <div style="padding: 0; line-height: 30px;">
                <img src="/fud.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>
                Upgrade with $FUD
            </div>
        </q-btn>

        <q-btn outline square color="white" @click="takeOutFud" :disable="!canWithdrawFud" v-if="!canUpgradeWithFud" class="q-mt-md">
            <div style="padding: 0; line-height: 30px;">
                <img src="/fud.png" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>
                Take out $FUD
            </div>
        </q-btn>

        <q-btn outline square color="white" @click="takeOutBuck" :disable="!canWithdrawBuck" v-if="!canUpgradeWithBuck" class="q-mt-md">
            <div style="padding: 0; line-height: 30px;">
                <img src="/buck.svg" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>
                Take out Bucket USD
            </div>
        </q-btn>

        <q-btn outline square color="white" @click="unstake" :disable="!canUnstakeBuck" v-if="stakedBuckAmountAsString && stakedBuckAmountAsString != '0'" class="q-mt-md">
            <div style="padding: 0; line-height: 30px;">
                <img src="/buck.svg" style="width: 30px; height: 30px; border-radius: 15px; vertical-align: middle;"/>
                Unstake Bucket USD
            </div>
        </q-btn>


    </q-card-section>
    </q-card>
    </div>
</div>

</template>
<script>
import DateHuman from 'shared/components/Helpers/DateHuman.vue';
import AskAmountDialog from '../ask_amount_dialog/AskAmountDialog.vue';

export default {
	name: 'TimecapsuleInfo',
    components:{
        DateHuman,
        AskAmountDialog,
    },
	props: {
        timecapsule: {
            type: Object,
        }
	},
	data() {
		return {
            contentSuiAmountAsString: '',
            fudAmountAsString: '',
            buckAmountAsString: '',
            stakedBuckAmountAsString: '',
            stakedBuckRewardsAsString: '',

            showUpgradeDialog: false,
		}
	},
	watch: {
        timecapsule: function() {
            this.recalcContent();
        }
	},
	methods: {
        async recalcContent() {
            try {
                clearTimeout(this.__refreshRewardsTimeout);
                this.contentSuiAmountAsString = await this.$store.sui.amountToString(this.timecapsule.contentSuiAmount);
                this.fudAmountAsString = await this.timecapsule.getStoredFUDAmount();
                this.buckAmountAsString = await this.timecapsule.getStoredBuckAmount();

                this.stakedBuckAmountAsString = await this.timecapsule.getStakedBuckAmount();
                if (this.stakedBuckAmountAsString && this.stakedBuckAmountAsString != '0' && this.stakedBuckAmountAsString != '0.0') {
                    this.stakedBuckRewardsAsString = await this.timecapsule.getExpectedStakedRewards();
                    clearTimeout(this.__refreshRewardsTimeout);
                    this.__refreshRewardsTimeout = setTimeout(()=>{
                        this.refreshRewards();
                    }, 100);
                } else {
                    this.stakedBuckRewardsAsString = '0';
                }                
            } catch (e) {
                console.error(e);
            }
        },
        async refreshRewards() {
            this.stakedBuckRewardsAsString = await this.timecapsule.getExpectedStakedRewards();
            this.__refreshRewardsTimeout = setTimeout(()=>{
                this.refreshRewards();
            }, 100);
        },
        async unstake() {
            if (!this.isConnected) {
                await this.$store.sui.request();
            }

            await this.$store.sui.timeCapsuleContract.unstakeBuck({
                timeCapsuleId: this.timecapsule.id,
            });
            await new Promise((res)=>setTimeout(res, 2000));
            await this.$store.sui.suiMaster.objectStorage.fetchObjects();
            await new Promise((res)=>setTimeout(res, 100));
            await this.timecapsule.refresh();
            await this.recalcContent();
            this.$emit('refresh');
        },
        async attachBuck() {
            if (!this.isConnected) {
                await this.$store.sui.request();
            }
            
            const amount = await this.$refs.askAmountDialog.ask({
                coinType: this.$store.sui.timeCapsuleContract.tokens.buck,
                note: 'may be unstaked anytime once capsule is decrypted'
            });
            await this.$store.sui.timeCapsuleContract.stakeBuck({
                timeCapsuleId: this.timecapsule.id,
                amount: amount,
                // coinType: this.$store.sui.timeCapsuleContract.tokens.buck,
                coin: 'buck',
            });
            await new Promise((res)=>setTimeout(res, 2000));
            await this.$store.sui.suiMaster.objectStorage.fetchObjects();
            await new Promise((res)=>setTimeout(res, 100));
            await this.timecapsule.refresh();
            await this.recalcContent();
            this.$emit('refresh');
        },
        async attachFud() {
            if (!this.isConnected) {
                await this.$store.sui.request();
            }
            

            const amount = await this.$refs.askAmountDialog.ask({
                coinType: this.$store.sui.timeCapsuleContract.tokens.fud,
                note: '1% to be taken as fee, rest is availiable for you anytime once capsule is decrypted'
            });
            await this.$store.sui.timeCapsuleContract.putCoin({
                timeCapsuleId: this.timecapsule.id,
                amount: amount,
                coinType: this.$store.sui.timeCapsuleContract.tokens.fud,
            });
            await new Promise((res)=>setTimeout(res, 2000));
            await this.$store.sui.suiMaster.objectStorage.fetchObjects();
            await new Promise((res)=>setTimeout(res, 100));
            await this.recalcContent();
            this.$emit('refresh');
        },
        async takeOutFud() {
            if (!this.isConnected) {
                await this.$store.sui.request();
            }
            

            await this.$store.sui.timeCapsuleContract.takeOutCoin({
                timeCapsuleId: this.timecapsule.id,
                coin: 'fud',
            });
            await new Promise((res)=>setTimeout(res, 2000));
            await this.recalcContent();
            this.$emit('refresh');
        },
        async takeOutBuck() {
            if (!this.isConnected) {
                await this.$store.sui.request();
            }

            await this.$store.sui.timeCapsuleContract.takeOutCoin({
                timeCapsuleId: this.timecapsule.id,
                coin: 'buck',
            });
            await new Promise((res)=>setTimeout(res, 2000));
            await this.recalcContent();
            this.$emit('refresh');
        },
	},
	computed: {
        isConnected: function() {
            return this.$store.sui.address;
        },
        canUnstakeBuck: function() {
            if (this.timecapsule.decrypted && this.stakedBuckAmountAsString && this.stakedBuckAmountAsString != '0' && this.stakedBuckAmountAsString != '0.0') {
                return true;
            }
            return false;

        },
        canUpgradeWithFud: function() {
            if (this.fudAmountAsString && this.fudAmountAsString != '0' && this.fudAmountAsString != '0.0') {
                return false;
            }
            return true;
        },
        canUpgradeWithBuck: function() {
            if (this.buckAmountAsString && this.buckAmountAsString != '0' && this.buckAmountAsString != '0.0') {
                return false;
            }
            return true;
        },
        canWithdrawFud: function() {
            if (this.timecapsule.decrypted && !this.canUpgradeWithFud) {
                return true;
            }
            return false;
        },
        canWithdrawBuck: function() {
            if (this.timecapsule.decrypted && !this.canUpgradeWithBuck) {
                return true;
            }
            return false;
        },
        currentDrandRound: function() {
            return this.$store.sui.drandRound;
        },
	},
	unmounted: function() {
	},
	mounted: function(){
        this.recalcContent();
	}
}
</script>
<style lang="css">


</style>