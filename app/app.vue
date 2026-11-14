<template>
  <div class="font-outfit">
    <LayoutHeader />
    <NuxtPage class="flex-grow h-[86vh]" />
    <LayoutFooter class="mt-auto" />
  </div>
</template>


<!-- export header dan footer -->

<script setup>
  import   LayoutHeader from '~/components/layout/header.vue' 
  import LayoutFooter from '~/components/layout/footer.vue'
</script>