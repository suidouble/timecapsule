<template>

<q-scroll-area style="height: calc(97vh - 150px); max-width: 300px;">
    <div class="timecapsule_links">
        <template v-for="(timeCapsule) in timeCapsules" v-bind:key="timeCapsule.id">
        <RouterLink :to="'/capsule/'+timeCapsule.id">
        <q-card class="timecapsule_link" flat bordered>
            <q-tooltip v-if="timeCapsule.ownedByYou">Yours</q-tooltip>
            <div class="timecapsule_link_left_own" :class="{timecapsule_link_left_own_by_you: timeCapsule.ownedByYou}">
            </div>
            <div class="timecapsule_link_left">
                <q-spinner-clock color="white" v-if="!timeCapsule.decrypted && !timeCapsule.readyToBeDecrypted" size="20px" />
                <q-icon name="lock" color="white" v-if="!timeCapsule.decrypted && timeCapsule.readyToBeDecrypted" size="20px" />
                <q-icon name="lock_open_right" color="white" v-if="timeCapsule.decrypted" size="20px" />
            </div>

            <!-- <q-card-section horizontal> -->
                    <!-- <q-icon name="favorite" color="white" /> -->
                {{timeCapsule.longDisplayId}}
            <!-- </q-card-section> -->
        </q-card>
        </RouterLink>
        </template>
    </div>
</q-scroll-area>
    
</template>
<script>
    // import DateHuman from 'shared/components/Helpers/DateHuman.vue';
    
    export default {
        name: 'ListTimecapsules',
        components:{
            // DateHuman,
        },
        props: {
        },
        data() {
            return {
                timeCapsules: [],
            }
        },
        watch: {
            connectionId: function() {
                clearTimeout(this.__loadMoreTimeout);
                this.__loadMoreTimeout = setTimeout(()=>{
                    this.loadMore();
                }, 1000);
            },
        },
        methods: {
            async loadMore() {
                if (this.$store.sui.timeCapsuleContract) {
                    await this.$store.sui.timeCapsuleContract.getMoreTimeCapsules();
                    this.timeCapsules = this.$store.sui.timeCapsuleContract.timeCapsules;
                }
            }
        },
        computed: {
            connectionId: function() {
                return this.$store.sui.connectionId;
            },
        },
        unmounted: function() {
            clearTimeout(this.__loadMoreTimeout);
        },
        mounted: function(){
            this.__loadMoreTimeout = setTimeout(()=>{
                this.loadMore();
            }, 1000);
        }
    }
    </script>
    <style lang="css">
    
        .timecapsule_links a {
            text-decoration: none;
        }

        .timecapsule_link {
            width: 100%;
            overflow: hidden;
            padding: 8px;
            margin-top: -2px;
            text-decoration: none;
        }

        .timecapsule_link_left {
            float: left;
            width: 30px;
        }

        .timecapsule_link_left_own {
            width: 5px;
            background: red;
            float: left;
            height: 38px;
            margin: -8px 8px -8px -8px;
            background-color: transparent;
        }

        .timecapsule_link_left_own_by_you {
            background-color: rgba(255,255,255,0.5);
        }
    
    </style>