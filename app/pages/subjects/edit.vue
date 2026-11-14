<script setup>
const route = useRoute()
const id = String(route.query.id ?? '')

const form = reactive({
  subject_name: '',
  mentor_name: '',
  description: '',
  duration: '',
})
const loading = ref(true)
const saving = ref(false)
const ready = ref(false)
const errorMessage = ref('')

async function loadSubject() {
  if (!/^\d+$/.test(id)) {
    errorMessage.value = 'ID subject tidak valid.'
    loading.value = false
    return
  }

  try {
    // API belum mempunyai GET /subjects/{id}, jadi ambil dari GET daftar.
    const response = await $fetch('/api/subjects', {
      headers: { Accept: 'application/json' },
    })
    const list = Array.isArray(response) ? response : response?.data
    if (!Array.isArray(list)) throw new Error('Format GET harus array atau { data: [...] }.')

    const subject = list.find((item) => String(item.id) === id)
    if (!subject) throw new Error('Subject tidak ditemukan dalam daftar.')

    form.subject_name = subject.subject_name ?? ''
    form.mentor_name = subject.mentor_name ?? ''
    form.description = subject.description ?? ''
    form.duration = subject.duration ?? ''
    ready.value = true
  } catch (error) {
    errorMessage.value = error?.data?.message || error?.message || 'Gagal mengambil subject.'
  } finally {
    loading.value = false
  }
}

async function updateSubject() {
  if (saving.value || !ready.value) return
  saving.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/subjects/${id}`, {
      method: 'PUT',
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
    errorMessage.value = error?.data?.message || error?.message || 'Gagal mengubah subject.'
  } finally {
    saving.value = false
  }
}

onMounted(loadSubject)
</script>


<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
    <div class="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <NuxtLink to="/subjects" class="text-sm text-blue-700 hover:underline">← Kembali ke daftar</NuxtLink>
      <h1 class="mt-4 text-3xl font-bold">Edit Subject</h1>
      <p class="mt-1 text-slate-600">Ubah data subject #{{ id }}.</p>

      <p v-if="loading" class="mt-6 text-slate-600">Memuat subject...</p>
      <p v-if="errorMessage" class="mt-5 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
        {{ errorMessage }}
      </p>

      <form v-if="ready" class="mt-6 space-y-4" @submit.prevent="updateSubject">
        <label class="block font-medium">
          Nama subject
          <input v-model="form.subject_name" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <label class="block font-medium">
          Nama mentor
          <input v-model="form.mentor_name" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <label class="block font-medium">
          Deskripsi
          <textarea v-model="form.description" required rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label class="block font-medium">
          Durasi
          <input v-model="form.duration" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
        </label>
        <button type="submit" :disabled="saving" class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>
  </main>
</template>