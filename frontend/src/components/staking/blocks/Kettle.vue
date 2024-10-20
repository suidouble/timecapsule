<template>

    <q-card class="bg-primary text-white q-mb-xs">
        <q-card-section>
            <q-markup-table separator="none" flat bordered style="background-color: transparent;">
                <tbody>
                    <tr>
                        <td class="text-left">Kettle</td>
                        <td class="text-left"><ExplorerLink :id="kettle.id" /></td>
                    </tr>
                    <tr>
                        <td class="text-left">Bag</td>
                        <td class="text-left"> {{kettle?.fields?.bag?.fields?.size}}  </td>
                    </tr>
                    <tr>
                        <td class="text-left">&nbsp;</td>
                        <td class="text-left">

                            <template v-for="(value, key) in actions" v-bind:key="key">
                                <q-btn :label="value" size="sm" outline  @click="$emit(key, kettle)"  />
                            </template>

                        </td>
                    </tr>
                </tbody>
            </q-markup-table>


        </q-card-section>
    </q-card>

</template>
<script>
import ExplorerLink from '../../common/ExplorerLink.vue';

export default {
    name: 'Kettle',
    components:{
        // DateHuman,
        ExplorerLink,
    },
    props: {
        kettle: Object,
        actions: Array,     
    },
    data() {
        return {
        }
    },
    watch: {
        connectionId: function() {
        },
    },
    methods: {
        async loadMore() {
        },
    },
    computed: {
    },
    unmounted: function() {
    },
    mounted: function(){
    }
}

    
</script>
<style lang="css">


</style>