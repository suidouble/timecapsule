<template>

	<q-chip size="20px" class="non-selectable cursor-pointer text-capitalize" square clickable @click="onClick" style="width: 110px">
		<q-avatar size="38px" icon="water_drop" font-size="38px" style="transform: rotate(0deg);"></q-avatar>
		<span class="gt-xs" style="position: absolute; display: block; left: 48px;top: -3px; letter-spacing: 2px;"><span style="font-size: 16px;">hex.</span></span>
		<span class="gt-xs" style="position: absolute; line-height: 18px; display: block; left: 48px;top: 17px; letter-spacing: 2.6px;"><span style="font-size: 16px;">capsule</span></span>
	</q-chip>

</template>

<script>
export default {
	name: 'Logo',
	components: {
	},
	data() {
		return {
			title: '',
		}
	},
	methods: {
		onClick: function() {
			this.$router.push('/');
		},
	},
	mounted() {
		this.title = this.$q.config.brand.title;
		// window.q = this.$q;
	},
	computed: {
	}
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.q-chip {
		margin-left: -3px;
		background-color: transparent;
		color: var(--text-color);
		text-transform: lowercase;
	}
	.body--dark .q-chip {
		color: var(--on-brand-text-color);
		color: var(--on-brand-text-color-dark);
	}
/* 
	.body--dark .q-header {
		backdrop-filter: var(--brand-back-filter);
		background-color: var(--brand-header-color-dark);
		color: var(--on-brand-text-color-dark);
	} */

	.q-chip span {
		margin-left: -5px;
	}
	@media (max-width: 1024px) {
		.q-chip span {
			margin-left: 0px;
		}
		.q-chip {
			margin-left: 0px;
		}
	}
/*	.q-avatar {
		background-image: url('../assets/logo.png');
		background-repeat: no-repeat;
		background-size: contain;
		background-position: left center;
		border-radius: 50%;
	}

	.q-chip .q-avatar {
		border-radius: 50%;
	}*/
</style>