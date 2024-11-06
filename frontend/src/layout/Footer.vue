<template>

  <!-- <q-footer reveal elevated> -->
  <q-footer reveal>
    <q-toolbar>
      <q-toolbar-title>

        <div class="fit row no-wrap justify-center items-start content-start">

          <q-btn flat icon="water_drop" type="a" target="_blank" href="https://blog.sui.io/2024-sui-overflow-hackathon-winners/" 
            size="sm" style="color: #8ce5f5"
              >Sui Overflow 2024, 3rd place in Randomness category</q-btn>

        </div>
        <div class="fit row no-wrap justify-center items-start content-start">

          <q-btn flat type="a" to="/about" label="about" />
          <q-btn flat type="a" href="https://github.com/suidouble/timecapsule" label="github" />
          <q-btn flat type="a" href="https://suidouble.github.io/vue-sui/" target="_blank" label="vue-sui" />
          <q-btn flat type="a" :href="packageIdURL" target="_blank" label="package_id" />
          <q-btn flat type="a" href="https://twitter.com/suidouble" target="_blank" label="twitter" />

 
        </div>

      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<script>

import ids from 'shared/classes/ids.js';

export default {
  name: 'Footer',
  components: {
  },
  computed: {
    packageIdURL() {
      return 'https://suivision.xyz/package/'+ids.mainnet.timecapsule.packageId;
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .q-footer {
		border-top: 1px solid rgba(192, 230, 255, .9);
    /* backdrop-filter: var(--brand-back-filter); */
    background: var(--brand-header-color);
    color: var(--on-brand-text-color);
  }

  .body--dark .q-footer {
    /* backdrop-filter: var(--brand-back-filter); */
    background: var(--brand-header-color-dark);
    color: var(--on-brand-text-color-dark);
  }

</style>