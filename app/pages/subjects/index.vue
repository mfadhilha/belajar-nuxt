<script setup>
const subjects = ref([]);
const loading = ref(true);
const deletingId = ref(null);
const errorMessage = ref('');
const showConfirm = ref(false);
const subjectToDelete = ref(null);

const currentPage = ref(1);
const lastPage = ref(1);
const perPage = ref(5);
const total = ref(0);
const from = ref(null);
const to = ref(null);

const filters = reactive({
    search: '',
    category: '',
    status: '',
    sort_by: 'id',
    sort_direction: 'asc',
});

const categories = [
    'General',
    'Programming',
    'Web Development',
    'Data Science',
];

async function loadSubjects(page = currentPage.value) {
    loading.value = true;
    errorMessage.value = '';

    try {
        const query = {
            page,
            per_page: perPage.value,
            sort_by: filters.sort_by,
            sort_direction: filters.sort_direction,
        }

        if (filters.search.trim() !== '') {
            query.search = filters.search.trim()
        }

        if (filters.category !== '') {
            query.category = filters.category
        }

        if (filters.status !== '') {
            query.status = filters.status
        }

        const response = await $fetch('/api/subjects', {
            query,
            headers: { Accept: 'application/json' },
        })

        if (Array.isArray(response)) {
          subjects.value = response;
          currentPage.value = 1
          lastPage.value = 1
          total.value = response.length
          from.value = response.length > 0 ? 1 : null
          to.value = response.length > 0 ? response.length : null
          return
        }

        if (!Array.isArray(response.data)) {
            throw new Error('Response pagination tidak valid');
        }

        subjects.value = response.data
        currentPage.value = Number(response.current_page ?? page)
        lastPage.value = Number(response.last_page ?? 1)
        perPage.value = Number(response.per_page ?? perPage.value)
        total.value = Number(response.total ?? response.data.length)
        from.value = response.from ?? null
        to.value = response.to ?? null
    } catch (error) {
        errorMessage.value = error?.data?.message || error?.message || 'Gagal mengambil data'
    } finally {
        loading.value = false
    }
}

async function applyFilters() {
    await loadSubjects(1)
}

async function resetFilters() {
    filters.search = ''
    filters.category = ''
    filters.status = ''
    filters.sort_by = 'id'
    filters.sort_direction = 'asc'

    await loadSubjects(1)
}

async function goToPage(page) {
    const targetPage = Number(page)

    if (loading.value) return
    if (!Number.isInteger(targetPage)) return
    if (targetPage < 1 || targetPage > lastPage.value) return
    if (targetPage === currentPage.value) return

    await loadSubjects(targetPage)
}

function openConfirm(subject) {
    if (deletingId.value !== null) return;
    subjectToDelete.value = subject;
    showConfirm.value = true;
}

function closeConfirm() {
    if (deletingId.value !== null) return;
    showConfirm.value = false;
    subjectToDelete.value = null;
}

async function deleteSubject() {
    const subject = subjectToDelete.value;
    if (!subject || deletingId.value !== null) return

    deletingId.value = subject.id;
    errorMessage.value = ''

    try {
        await $fetch(`/api/subjects/${subject.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
            retry: 0,
        })

        const targetPage =
            subjects.value.length === 1 && currentPage.value > 1
                ? currentPage.value - 1
                : currentPage.value

        await loadSubjects(targetPage);
    } catch (error) {
        errorMessage.value = error?.data?.message || error?.message || 'Gagal hapus data';
    } finally {
        deletingId.value = null;
        closeConfirm();
    }
}

onMounted(() => {
    loadSubjects(1)
})
</script>

<template>
  <main class="min-h-screen px-10 py-10 text-slate-900">
    <div class="mx-auto">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Daftar Subject</h1>
          <p class="mt-1 text-slate-600">Lihat, cari, dan kelola mata pelajaran.</p>
        </div>
        <NuxtLink to="/subjects/create" class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          + Tambah Subject
        </NuxtLink>
      </div>

      <form
        class="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
        @submit.prevent="applyFilters"
      >
        <div>
          <label class="mb-1 block text-sm font-medium">Cari</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nama subject, mentor, deskripsi, atau durasi"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Kategori</label>
          <select v-model="filters.category" class="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Semua kategori</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Status</label>
          <select v-model="filters.status" class="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak aktif</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Urutkan berdasarkan</label>
          <select v-model="filters.sort_by" class="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="id">ID</option>
            <option value="subject_name">Nama Subject</option>
            <option value="mentor_name">Nama Mentor</option>
            <option value="duration">Durasi</option>
            <option value="created_at">Tanggal dibuat</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Arah urutan</label>
          <select v-model="filters.sort_direction" class="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="loading"
          >
            Terapkan
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-50"
            :disabled="loading"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>
      </form>

      <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
        {{ errorMessage }}
      </p>

      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <p v-if="loading" class="p-6 text-slate-600">Memuat data...</p>
        <p v-else-if="subjects.length === 0" class="p-6 text-slate-600">Subject tidak ditemukan.</p>

        <table v-else class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-slate-100 text-slate-700">
            <tr>
              <th class="p-4">ID</th>
              <th class="p-4">Subject</th>
              <th class="p-4">Mentor</th>
              <th class="p-4">Deskripsi</th>
              <th class="p-4">Kategori</th>
              <th class="p-4">Durasi</th>
              <th class="p-4">Status</th>
              <th class="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="subject in subjects" :key="subject.id">
              <td class="p-4">{{ subject.id }}</td>
              <td class="p-4 font-medium">{{ subject.subject_name }}</td>
              <td class="p-4">{{ subject.mentor_name }}</td>
              <td class="p-4">{{ subject.description }}</td>
              <td class="p-4">{{ subject.category }}</td>
              <td class="p-4">{{ subject.duration }}</td>
              <td class="p-4">{{ subject.status === 'active' ? 'Aktif' : 'Tidak aktif' }}</td>
              <td class="p-4 whitespace-nowrap">
                <NuxtLink :to="{ path: '/subjects/edit', query: { id: subject.id } }" class="mr-3 text-blue-700 hover:underline">
                  Edit
                </NuxtLink>
                <button :disabled="deletingId !== null" class="text-red-700 hover:underline disabled:opacity-50" @click="openConfirm(subject)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-gray-600">
            Menampilkan
            <span class="font-semibold">{{ from ?? 0 }}</span>
            sampai
            <span class="font-semibold">{{ to ?? 0 }}</span>
            dari
            <span class="font-semibold">{{ total }}</span>
            subject
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage <= 1 || loading"
              @click="goToPage(currentPage - 1)"
            >
              Sebelumnya
            </button>

            <span class="min-w-28 text-center text-sm">
              Halaman {{ currentPage }} dari {{ lastPage }}
            </span>

            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage >= lastPage || loading"
              @click="goToPage(currentPage + 1)"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeConfirm">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
        <h2 class="text-xl font-bold">Hapus Subject</h2>
        <p class="mt-2 text-slate-600">
          Yakin mau hapus subject
          <span class="font-semibold">{{ subjectToDelete?.subject_name }}</span>?
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            :disabled="deletingId !== null"
            class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-50"
            @click="closeConfirm">
            Batal
          </button>
          <button
            :disabled="deletingId !== null"
            class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            @click="deleteSubject()">
            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>