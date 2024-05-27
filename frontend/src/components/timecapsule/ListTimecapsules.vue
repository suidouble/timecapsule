<template>

    <div class="timecapsule_links">
        <template v-for="(timeCapsule) in timeCapsules" v-bind:key="timeCapsule.id">
        <RouterLink :to="'/capsule/'+timeCapsule.id">
        <q-card class="timecapsule_link" flat bordered>
            <div class="timecapsule_link_left">
                <q-spinner-clock color="white" size="20px" />
            </div>

            <!-- <q-card-section horizontal> -->
                    <!-- <q-icon name="favorite" color="white" /> -->
                {{timeCapsule.longDisplayId}}
            <!-- </q-card-section> -->
        </q-card>
        </RouterLink>
        </template>
    </div>
    
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
    
    </style>