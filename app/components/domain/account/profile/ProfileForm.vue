<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon } from '@lucide/vue'
import type { Profile } from '#shared/types/profile'
import type { SelectOption } from '@/components/common/forms/AppSelect.vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { getProfileSchema, type ProfileFormValues } from './profileFormSchema'
import Initials from '@/components/domain/project/dashboard/users/components/Initials.vue'
import ImageUploader from '@/components/domain/project/dashboard/uploader/ImageUploader.vue'
import type { ImageFileWithImageId } from '@/components/domain/project/dashboard/uploader/types'

interface Props {
  profile: Profile
}

const props = defineProps<Props>()

const { t } = useI18n()
const { getSession } = useAuth()

const isLoading = ref(false)

const genderOptions: SelectOption[] = [
  { label: t('main.male'), value: 'male' },
  { label: t('main.female'), value: 'female' },
  { label: t('main.other'), value: 'other' },
]

const profileSchema = getProfileSchema(t)

const defaultValues = {
  name: props.profile.name,
  surname: props.profile.surname,
  birthdate: props.profile.birthdate,
  gender: props.profile.gender,
  phone: props.profile.phone,
  email: props.profile.email,
  imageId: props.profile.image?.id ? Number(props.profile.image.id) : undefined,
} satisfies ProfileFormValues

const { handleSubmit, meta, setFieldValue } = useForm<ProfileFormValues>({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: defaultValues,
})

const avatar = computed(() => props.profile.image?.url)

const onImageFileChange = (file: ImageFileWithImageId | null) => {
  setFieldValue('imageId', file?.imageId)
}

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  try {
    await $fetch('/api/account/profile', {
      method: 'PATCH',
      body: {
        name: data.name,
        surname: data.surname,
        birthdate: data.birthdate ?? '',
        gender: data.gender ?? '',
        phone: data.phone ?? '',
        email: data.email,
        imageId: data.imageId,
      },
    })

    AppToast.success(t('pages.account.profile.profile_update_success'))

    await getSession()
  }
  catch {
    AppToast.error(t('pages.account.profile.profile_update_error'))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <ImageUploader
      folder="users"
      :default-image="avatar"
      info-position="left"
      :aspect-ratio="1"
      crop-shape="round"
      :output-size="{ width: 256, height: 256 }"
      :thumbnail-size="{ width: 96, height: 96 }"
      :small-size="{ width: 48, height: 48 }"
      :on-file-change="onImageFileChange"
    >
      <template #fallback>
        <Initials :name="`${profile.name} ${profile.surname}`" />
      </template>
    </ImageUploader>

    <form class="w-full flex flex-col gap-4" @submit="onSubmit">
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormAppInputText
          name="name"
          :label="t('main.name')"
          :placeholder="t('main.name_placeholder')"
          required
          :disabled="isLoading"
          clearable
        />
        <FormAppInputText
          name="surname"
          :label="t('main.surname')"
          :placeholder="t('main.surname_placeholder')"
          required
          :disabled="isLoading"
          clearable
        />
        <FormAppDatePicker
          name="birthdate"
          :label="t('main.birthdate')"
          :placeholder="t('main.birthdate_placeholder')"
          :disabled="isLoading"
        />
        <FormAppSelect
          name="gender"
          :label="t('main.gender')"
          :options="genderOptions"
          :placeholder="t('main.gender_placeholder')"
          :disabled="isLoading"
        />
        <FormAppInputTel
          name="phone"
          :label="t('main.phone')"
          :placeholder="t('main.phone_placeholder')"
          :disabled="isLoading"
          clearable
        />
        <FormAppInputEmail
          name="email"
          :label="t('main.email')"
          :placeholder="t('main.email_placeholder')"
          required
          :disabled="isLoading"
          clearable
        />
      </div>
      <div class="w-full flex flex-row items-center justify-center sm:justify-end gap-2">
        <AppButton
          type="submit"
          :label="t('main.save_button')"
          :disabled="!meta.valid || isLoading"
        >
          <template #icon>
            <Loader2Icon v-if="isLoading" class="animate-spin flex-none h-4 aspect-square" />
            <SaveIcon v-else class="flex-none h-4 aspect-square" />
          </template>
        </AppButton>
      </div>
    </form>
  </div>
</template>
