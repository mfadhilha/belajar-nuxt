<script setup>
const form = reactive({
    subject_name: '',
    mentor_name: '',
    description: '',
    duration: '',
})
const saving = ref(false)
const errorMessage = ref('')

async function saveSubject() {
    if (saving.value) return
    saving.value = true
    errorMessage.value = ''

    try {
        await $fetch('/api/subjects', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: {
                subject_name: form.subject_name,
                mentor_name: form.mentor_name,
                description: form.description,
                duration: form.duration,
            },
            retry: 0,
        })
        await navigateTo('/subjects')
    } catch (error) {
        errorMessage.value = error?.data?.message || error?.message || 'Gagal simpan data';
    } finally {
        saving.value = false;
    }
}
</script>



<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
    <div class="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <NuxtLink to="/subjects" class="text-sm text-blue-700 hover:underline">← Kembali ke daftar</NuxtLink>
      <h1 class="mt-4 text-3xl font-bold">Tambah Subject</h1>
      <p class="mt-1 text-slate-600">Masukkan data subject baru.</p>

      <p v-if="errorMessage" class="mt-5 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
        {{ errorMessage }}
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="saveSubject">
        <label class="block font-medium">
          Nama subject
          <input v-model="form.subject_name" required placeholder="Matematika" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <label class="block font-medium">
          Nama mentor
          <input v-model="form.mentor_name" required placeholder="Aiman Wafi'i An-Nawal" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <label class="block font-medium">
          Deskripsi
          <textarea v-model="form.description" required placeholder="Menghitung Angka" rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label class="block font-medium">
          Durasi
          <input v-model="form.duration" required placeholder="90 menit" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <button type="submit" :disabled="saving" class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {{ saving ? 'Menyimpan...' : 'Simpan Subject' }}
        </button>
      </form>
    </div>
  </main>
</template>