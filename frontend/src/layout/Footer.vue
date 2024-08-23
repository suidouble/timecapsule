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

          <q-btn flat type="a" to="/about" label="About" />
          <q-btn flat type="a" href="https://github.com/suidouble/timecapsule" label="GitHub" />
          <q-btn flat type="a" href="https://twitter.com/suidouble" target="_blank" label="Twitter" />

 
        </div>

      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<script>

export default {
  name: 'Footer',
  components: {
  },
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