<template>

	<div class="row">
        <div class="col-12">

            <q-splitter
                v-model="splitterModel"
                style="height: 80vh"
                >

                <template v-slot:before>
                    <q-tabs
                        v-model="tab"
                        vertical
                        class="text-teal"
                        >
                    <q-tab name="timecapsule" icon="schedule" label="TimeCapsule" />
                    <q-tab name="local" icon="movie" label="Localnet Setup" />
                    <q-tab name="add_kettle" icon="water" label="Add Kettle" />
                    <q-tab name="your_kettles" icon="water" label="Your Kettles" />

                    <q-tab name="add_condenser" icon="hot_tub" label="Add Condenser" />
                    <q-tab name="your_condensers" icon="hot_tub" label="Your Condensers" />


                    <q-tab name="movies" icon="movie" label="Stats" />
                    </q-tabs>
                </template>

                <template v-slot:after>
                    <q-tab-panels
                    v-model="tab"
                    animated
                    swipeable
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                    >
                        <q-tab-panel name="timecapsule"><TimeCapsuleAdmin /></q-tab-panel>
                        <q-tab-panel name="local"><LocalnetSetup /></q-tab-panel>
                        <q-tab-panel name="add_kettle"><AddKettle /></q-tab-panel>
                        <q-tab-panel name="your_kettles"><YourKettles /></q-tab-panel>
                        <q-tab-panel name="add_condenser"><AddCondenser /></q-tab-panel>
                        <q-tab-panel name="your_condensers"><YourCondensers /></q-tab-panel>
                    </q-tab-panels>
                </template>

            </q-splitter>

		</div>
	</div>

</template>

<script>

import AddKettle from 'components/staking/AddKettle.vue';
import YourKettles from 'components/staking/YourKettles.vue';
import LocalnetSetup from 'components/staking/LocalnetSetup.vue';

import AddCondenser from 'components/staking/AddCondenser.vue';
import YourCondensers from 'components/staking/YourCondensers.vue';

import TimeCapsuleAdmin from 'components/staking/TimeCapsuleAdmin.vue';

export default {
	name: 'StakingAdmin',
	title: 'Staking Admin',
	authRequired: false,
	path: '/staking/admin',

	props: {
	},
    components: {
        AddKettle,
        YourKettles,
        LocalnetSetup,
        AddCondenser,
        YourCondensers,

        TimeCapsuleAdmin,
    },
	data() {
		return {
			isActive: false,
            tab: 'add_kettle',
            splitterModel: 20,
		}
	},
	methods: {
	},
	mounted() {
	}
}
</script>
<style scoped>

</style>

