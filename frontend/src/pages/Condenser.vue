<template>

    <div class="row">
        <div class="col-2">
        &nbsp;
        </div>
        <div class="col-8">

            <q-banner class="bg-primary text-white">
            Let the condenser <q-btn :href="'/condenser/'+condenserId" outline size="sm" icon="open_in_new" target="_blank" color="white" label="0xfafa23...23" />  
            converts time from your time capsules into valuable rewards
            </q-banner>

            <Stake v-if="condenserId" :condenserId="condenserId" />

            <YourStakes v-if="condenserId" :condenserId="condenserId"  />

        </div>
        <div class="col-2">
        &nbsp;
        </div>
    </div>

</template>

<script>
import Stake from 'components/condenser/Stake.vue';
import YourStakes from 'components/condenser/YourStakes.vue';

export default {
	name: 'CondenserPage',
    path: '/condenser/:id',
	props: {
	},
    components: {
        Stake,
        YourStakes,
    },
	data() {
		return {
            chain: 'sui:mainnet',

            condenserId: null,   
		}
	},
    watch: {
        "$route.params.id": function() {
            alert('id');
        },
        connectionId() {
            if (this.connectionId) {
                this.loadInfo();
            }
        }
    },
	methods: {
        async stake() {

        },
        async loadInfo() {
            this.$log.tag('CondenserPage').info('LoadInfo');
        },
	},
    computed: {
        isConnected: function() {
            return this.$store.sui.address;
        },
    },
    beforeMount() {
    },
    beforeUnmount() {
    },
    mounted() {
        this.condenserId = this.$route.params.id;
        if (this.connectionId) {
            this.loadInfo();
        }

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

    .content_info {
        opacity: 0;
        cursor: pointer;
        text-align: center; 
        margin-top: -170px; 
        font-size: 20px;
        transition: opacity 1s;
    }

    .content_info.content_info_visible {
        opacity: 1;
    }

    .content_info_decrypted {
        opacity: 0;
        text-align: center; 
        margin-top: 0px; 
        font-size: 20px;
        transition: opacity 1s;    
        width: 400px;
        word-break: break-word;
    }
    .content_info_decrypted.content_info_visible {
        opacity: 1;
    }

    .timecapsule_container {
        opacity: 1;
        transition: opacity 0.5s ease;
    }
    .timecapsule_container.decrypting {
        opacity: 0.5;
    }


</style>

