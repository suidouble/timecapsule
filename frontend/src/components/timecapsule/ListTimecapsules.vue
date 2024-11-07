<template>

<q-scroll-area class="list_timecapsules_area">
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

                <span style="color: #f5c98c" v-if="timeCapsule.level == 1"><q-icon name="star_rate" size="20px" /></span>
                <span style="color: #8ce5f5" v-if="timeCapsule.level > 1"><q-icon name="star_rate" size="20px" /></span>
            <!-- </q-card-section> -->
        </q-card>
        </RouterLink>
        </template>
    </div>
</q-scroll-area>
    
</template>
<style lang="css">

    .list_timecapsules_area {
        height: calc(97vh - 160px);
        border-top: 1px solid rgba(255, 255, 255, 0.28);
    }

    @media (min-width: 1440px) {
        .list_timecapsules_area {
            max-width: 300px;
        }
    }

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