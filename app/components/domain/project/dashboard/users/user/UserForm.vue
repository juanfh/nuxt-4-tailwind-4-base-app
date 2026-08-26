<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon, XIcon } from '@lucide/vue'
import type { User } from '#shared/types/project/user'
import type { SelectOption } from '@/components/common/forms/AppSelect.vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@/components/domain/auth/password/passwordFormSchema'
import { getProjectUserSchema, type ProjectUserFormValues } from './userFormSchema'
import Avatar from '../components/Avatar.vue'
import Initials from '../components/Initials.vue'
import DeleteUser from '../delete/DeleteUser.vue'
import ImageUploader from '@/components/domain/project/dashboard/uploader/ImageUploader.vue'
import type { ImageFileWithImageId } from '@/components/domain/project/dashboard/uploader/types'

interface Props {
  mode: 'view' | 'edit' | 'create'
  user?: User
  editable?: boolean
}

const props = defineProps<Props>()

const { user: sessionUser } = useClientSessionUser()
const canManageRole = computed(() => isSuperAdminRole(sessionUser?.role ?? null))
const router = useRouter()

const { t } = useI18n()

const isLoading = ref(false)

const avatar = computed(() => props.user?.image?.url)

const genderOptions: SelectOption[] = [
  { label: t('main.male'), value: 'male' },
  { label: t('main.female'), value: 'female' },
  { label: t('main.other'), value: 'other' },
]

const roleOptions: SelectOption[] = [
  { label: t('main.role_admin'), value: 'admin' },
  { label: t('main.role_user'), value: 'user' },
]

const userSchema = getProjectUserSchema(t, props.mode)

const defaultValues = {
  name: props.user?.name ?? '',
  surname: props.user?.surname ?? '',
  birthdate: props.user?.birthdate ?? '',
  gender: props.user?.gender ?? '',
  phone: props.user?.phone ?? '',
  email: props.user?.email ?? '',
  role: props.user?.role ?? 'user',
  password: '',
  confirmPassword: '',
  imageId: props.user?.image?.id ? Number(props.user.image.id) : undefined,
} satisfies ProjectUserFormValues

const { handleSubmit, meta, setFieldValue } = useForm<ProjectUserFormValues>({
  validationSchema: toTypedSchema(userSchema),
  initialValues: defaultValues,
})

const onImageFileChange = (file: ImageFileWithImageId | null) => {
  setFieldValue('imageId', file?.imageId)
}

const { value: passwordValue } = useField<string>('password')

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const body: Record<string, unknown> = {
    name: data.name,
    surname: data.surname,
    birthdate: data.birthdate ?? '',
    gender: data.gender ?? '',
    phone: data.phone ?? '',
    email: data.email,
  }
  if (canManageRole.value) {
    body.role = data.role ?? ''
  }
  if (props.mode === 'create' || (props.mode === 'edit' && data.password)) {
    body.password = data.password ?? ''
    body.confirmPassword = data.confirmPassword ?? ''
  }
  if (data.imageId !== undefined) {
    body.imageId = data.imageId
  }

  try {
    if (props.user?.id) {
      await $fetch(`/api/users/${props.user.id}`, { method: 'PATCH', body })
    }
    else {
      await $fetch('/api/users', { method: 'POST', body })
    }

    AppToast.success(t(props.mode === 'create' ? 'pages.users.user_created_success' : 'pages.users.user.user_update_success'))

    router.back()
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    const errorMessage = statusCode === 409
      ? t('pages.users.user_email_conflict_error')
      : t(props.mode === 'create' ? 'pages.users.user_created_error' : 'pages.users.user.user_update_error')
    AppToast.error(errorMessage)
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <Avatar v-if="mode === 'view'" :name="`${user?.name} ${user?.surname}`" :image="avatar" />
    <ImageUploader
      v-else
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
        <Initials :name="`${user?.name} ${user?.surname}`" />
      </template>
    </ImageUploader>

    <form class="w-full flex flex-col gap-4" @submit="onSubmit">
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormAppInputText
          name="name"
          :label="t('main.name')"
          :placeholder="t('main.name_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppInputText
          name="surname"
          :label="t('main.surname')"
          :placeholder="t('main.surname_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppDatePicker
          name="birthdate"
          :label="t('main.birthdate')"
          :placeholder="t('main.birthdate_placeholder')"
          :disabled="!editable || isLoading"
        />
        <FormAppSelect
          name="gender"
          :label="t('main.gender')"
          :options="genderOptions"
          :placeholder="t('main.gender_placeholder')"
          :disabled="!editable || isLoading"
        />
        <FormAppInputTel
          name="phone"
          :placeholder="t('main.phone_placeholder')"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppInputEmail
          name="email"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <template v-if="canManageRole">
          <FormAppSelect
            name="role"
            :label="t('main.role')"
            :options="roleOptions"
            :placeholder="t('main.role_placeholder')"
            :disabled="!editable || isLoading"
          />
          <div v-if="mode === 'create'" />
        </template>
        <template v-if="mode === 'create' || mode === 'edit'">
          <div v-if="mode === 'edit'" class="col-span-full border-t border-form-border" />
          <FormAppInputPassword
            name="password"
            :label="t('main.password')"
            :placeholder="t('main.password_placeholder')"
            :required="mode === 'create' && editable"
            :disabled="!editable || isLoading"
            :clearable="editable"
            auto-complete="new-password"
          />
          <FormAppInputPassword
            name="confirmPassword"
            :label="t('main.confirm_password')"
            :placeholder="t('main.confirm_password_placeholder')"
            :required="mode === 'create' && editable"
            :disabled="!editable || isLoading"
            :clearable="editable"
            auto-complete="new-password"
          />
          <div class="col-span-full grid grid-cols-2 gap-2">
            <RuleCheck
              :label="t('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })"
              :success="(passwordValue ?? '').length >= MIN_PASSWORD_LENGTH && (passwordValue ?? '').length <= MAX_PASSWORD_LENGTH"
            />
            <RuleCheck :label="t('main.password_uppercase')" :success="/[A-Z]/.test(passwordValue ?? '')" />
            <RuleCheck :label="t('main.password_lowercase')" :success="/[a-z]/.test(passwordValue ?? '')" />
            <RuleCheck :label="t('main.password_number')" :success="/[0-9]/.test(passwordValue ?? '')" />
            <RuleCheck :label="t('main.password_special')" :success="/[^a-zA-Z0-9]/.test(passwordValue ?? '')" />
          </div>
        </template>
      </div>

      <div v-if="editable" class="w-full flex flex-row items-center gap-2">
        <DeleteUser v-if="mode === 'edit' && user" :user="user" is-button />
        <div class="flex flex-row items-center gap-2 ml-auto">
          <AppButton
            variant="outline"
            :label="t('main.cancel_button')"
            @click="router.back()"
          >
            <template #icon>
              <XIcon class="flex-none h-4 aspect-square" />
            </template>
          </AppButton>
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
      </div>
    </form>
  </div>
</template>
