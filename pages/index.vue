<template>
  <Uploader/>
</template>

<script lang="ts">
import Vue from 'vue'
import Uploader from '~/components/Uploader.vue';

export default Vue.extend({
    name: "IndexPage",
    components: { Uploader }
})
</script>
