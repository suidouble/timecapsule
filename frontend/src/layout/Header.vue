<template>

	<q-header reveal height-hint="61.59">
		<q-toolbar  class="q-pa-sm q-px-md" >

			<!-- <q-btn flat round dense icon="menu" class="q-mr-sm lt-md" @click="menu" /> -->

			<Logo inline  />
			<q-space />

			<q-space />
			<ChainSelector />


		</q-toolbar>


	</q-header>

</template>
<script>
// import ColorWave from '../components/ColorWave.vue';
import Logo from './Logo';
// import Auth from 'shared/components/Auth';
import ChainSelector from '../components/chain_selector/ChainSelector.vue';
// import DarkChanger from 'shared/components/LayoutElements/DarkChanger.vue';
// import Notifications from 'shared/components/LayoutElements/Notifications.vue';

export default {
	name: 'Header',
	components: {
		Logo,
		// Auth,
		// MaintenanceSwitcher,
		// DarkChanger,
		ChainSelector,
		// ColorWave,
		// Notifications,
	},
	data() {
		return {
		}
	},
	methods: {
		menu: function() {
			this.$emit('menu');
		},
		onLogo: function() {
			this.$router.push('/');
		},
		// signIn: function() {
		// 	this.$store.sessionUser.doSignIn();
		// },
		// signUp: function() {
		// 	this.$store.sessionUser.doRegister();
		// },
		// logOut: function() {
		// 	this.$store.sessionUser.doLogOut();
		// }
	},
	computed: {
		// registrationDisabled: function() {
		// 	return this.$q.config.registrationDisabled;
		// },
		// maintenance: function() {
		// 	return false;// this.$store.state.maintenance.maintenance;
		// },
		// sessionUsername() {
		// 	return (this.$store.sessionUser.me ? this.$store.sessionUser.me.username : null);
		// },
		// sessionInitializing() {
		// 	return (!!(this.$store?.sessionUser?.isSessionInitializing));
		// },
		// authenticated() {
		// 	return (!!this.$store.sessionUser.me);
		// }
	},
	beforeMount: function() {
	},
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.q-header {
		/* backdrop-filter: var(--brand-back-filter); */
		background: var(--brand-header-color);
		color: var(--on-brand-text-color);
		border-bottom: 1px solid rgba(192, 230, 255, .9);
	}

	.body--dark .q-header {
		/* backdrop-filter: var(--brand-back-filter); */
		background: var(--brand-header-color-dark);
		color: var(--on-brand-text-color-dark);
	}

	a.logo {
		position: relative;
		display: block;
		height: 50px;
		line-height: 50px;
		text-indent: 58px;
		text-decoration: none;
		overflow: hidden;
		background-image: url('../assets/logo.png');
		background-repeat: no-repeat;
		background-size: contain;
		background-position: left center;
		padding-right: 14px;
	}
</style>