<script setup lang="ts">
import TiptapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  Link2OffIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from '@lucide/vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  label?: string
  value: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}

const props = defineProps<Props>()

const { t } = useI18n()

const linkPopoverOpen = ref(false)
const linkUrlDraft = ref('')

// Nuxt/Vue no tiene el problema de closures obsoletas de React con onChange
// entre renders (props es reactivo y siempre está al día) — no hace falta el
// onChangeRef del original, era un workaround específico de React.
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      horizontalRule: false,
      code: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TiptapLink.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? '' }),
  ],
  content: props.value,
  editable: !props.disabled,
  immediatelyRender: false,
  editorProps: {
    attributes: {
      id: props.id,
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-labelledby': `${props.id}-label`,
      class: cn(
        'ckcontent min-h-32 w-full rounded-b-md border px-3 py-2 text-sm text-form-item-text outline-none',
        '[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-neutral-500 dark:[&_p.is-editor-empty:first-child]:before:text-neutral-400 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
        props.error ? 'border-red-500 focus:border-red-500' : 'border-form-item-border focus:border-primary-500',
        props.disabled && 'cursor-not-allowed opacity-50',
      ),
    },
  },
  onUpdate: ({ editor }) => props.onChange(editor.getHTML()),
})

// Sincroniza cambios externos (reset del form, remount con otro item...) sin
// re-emitir onChange y sin pisar lo que el usuario está escribiendo.
watch(() => props.value, (value) => {
  if (!editor.value) return
  if (value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value || '', false)
  }
})

watch(() => props.disabled, (disabled) => {
  // segundo argumento false: setEditable emite 'update' por defecto (incluso
  // sin cambios reales en el contenido), lo que pisaría el value externo con
  // el HTML ya reformateado por Tiptap en el primer mount.
  editor.value?.setEditable(!disabled, false)
})

const isLinkActive = computed(() => editor.value?.isActive('link') ?? false)

const openLinkPopover = () => {
  linkUrlDraft.value = editor.value?.getAttributes('link').href ?? ''
  linkPopoverOpen.value = true
}

const applyLink = () => {
  if (!editor.value) return
  const url = linkUrlDraft.value.trim()
  if (!url) {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  }
  else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  linkPopoverOpen.value = false
}

const removeLink = () => {
  editor.value?.chain().focus().unsetLink().run()
  linkPopoverOpen.value = false
}
</script>

<template>
  <div class="w-full">
    <Label v-if="label !== undefined" :id="`${id}-label`" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <div :class="cn('w-full rounded-md', disabled && 'pointer-events-none opacity-50')">
      <div :class="cn('flex flex-row flex-wrap items-center gap-1 rounded-t-md border border-b-0 bg-form-item-bg p-1', error ? 'border-red-500' : 'border-form-item-border')">
        <AppTooltip :content="t('main.rich_text_bold')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('bold') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_bold')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <template #icon>
              <BoldIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_italic')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('italic') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_italic')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <template #icon>
              <ItalicIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_strike')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('strike') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_strike')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleStrike().run()"
          >
            <template #icon>
              <StrikethroughIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_underline')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('underline') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_underline')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleUnderline().run()"
          >
            <template #icon>
              <UnderlineIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>

        <Separator orientation="vertical" class="h-5" />

        <AppTooltip :content="t('main.rich_text_heading_2')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_heading_2')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            <template #icon>
              <Heading2Icon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_heading_3')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_heading_3')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          >
            <template #icon>
              <Heading3Icon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>

        <Separator orientation="vertical" class="h-5" />

        <AppTooltip :content="t('main.rich_text_bullet_list')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('bulletList') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_bullet_list')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <template #icon>
              <ListIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_ordered_list')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('orderedList') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_ordered_list')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <template #icon>
              <ListOrderedIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_quote')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive('blockquote') ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_quote')"
            :disabled="disabled"
            @click="editor?.chain().focus().toggleBlockquote().run()"
          >
            <template #icon>
              <QuoteIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>

        <Separator orientation="vertical" class="h-5" />

        <AppTooltip :content="t('main.rich_text_align_left')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_align_left')"
            :disabled="disabled"
            @click="editor?.chain().focus().setTextAlign('left').run()"
          >
            <template #icon>
              <AlignLeftIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_align_center')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_align_center')"
            :disabled="disabled"
            @click="editor?.chain().focus().setTextAlign('center').run()"
          >
            <template #icon>
              <AlignCenterIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_align_right')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_align_right')"
            :disabled="disabled"
            @click="editor?.chain().focus().setTextAlign('right').run()"
          >
            <template #icon>
              <AlignRightIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>
        <AppTooltip :content="t('main.rich_text_align_justify')" position="top">
          <SquareIconButton
            type="button"
            bsize="small"
            :variant="editor?.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'"
            :aria-label="t('main.rich_text_align_justify')"
            :disabled="disabled"
            @click="editor?.chain().focus().setTextAlign('justify').run()"
          >
            <template #icon>
              <AlignJustifyIcon class="flex-none h-4 aspect-square" />
            </template>
          </SquareIconButton>
        </AppTooltip>

        <Separator orientation="vertical" class="h-5" />

        <Popover v-model:open="linkPopoverOpen">
          <AppTooltip :content="t('main.rich_text_link')" position="top">
            <PopoverTrigger as-child>
              <SquareIconButton
                type="button"
                bsize="small"
                :variant="isLinkActive ? 'secondary' : 'ghost'"
                :aria-label="t('main.rich_text_link')"
                :disabled="disabled"
                @click="openLinkPopover"
              >
                <template #icon>
                  <LinkIcon class="flex-none h-4 aspect-square" />
                </template>
              </SquareIconButton>
            </PopoverTrigger>
          </AppTooltip>
          <PopoverContent align="start" class="w-72 bg-form-item-bg border border-form-item-border flex flex-row items-center gap-2 p-2">
            <Input
              v-model="linkUrlDraft"
              autofocus
              :placeholder="t('main.rich_text_link_url_placeholder')"
              class="bg-white dark:bg-neutral-900 border-form-item-border text-form-item-text"
              @keydown.enter.prevent="applyLink"
            />
            <SquareIconButton
              v-if="isLinkActive"
              type="button"
              bsize="small"
              variant="outline"
              :aria-label="t('main.rich_text_link_remove')"
              @click="removeLink"
            >
              <template #icon>
                <Link2OffIcon class="flex-none h-4 aspect-square" />
              </template>
            </SquareIconButton>
            <SquareIconButton
              type="button"
              bsize="small"
              variant="default"
              :aria-label="t('main.rich_text_link_apply')"
              other-classes="w-auto px-2"
              @click="applyLink"
            >
              <template #icon>
                <LinkIcon class="flex-none h-4 aspect-square" />
              </template>
            </SquareIconButton>
          </PopoverContent>
        </Popover>

        <div class="ml-auto flex flex-row items-center gap-1">
          <AppTooltip :content="t('main.rich_text_undo')" position="top">
            <SquareIconButton
              type="button"
              bsize="small"
              variant="ghost"
              :aria-label="t('main.rich_text_undo')"
              :disabled="disabled || !editor?.can().undo()"
              @click="editor?.chain().focus().undo().run()"
            >
              <template #icon>
                <Undo2Icon class="flex-none h-4 aspect-square" />
              </template>
            </SquareIconButton>
          </AppTooltip>
          <AppTooltip :content="t('main.rich_text_redo')" position="top">
            <SquareIconButton
              type="button"
              bsize="small"
              variant="ghost"
              :aria-label="t('main.rich_text_redo')"
              :disabled="disabled || !editor?.can().redo()"
              @click="editor?.chain().focus().redo().run()"
            >
              <template #icon>
                <Redo2Icon class="flex-none h-4 aspect-square" />
              </template>
            </SquareIconButton>
          </AppTooltip>
        </div>
      </div>

      <EditorContent :editor="editor" />
    </div>

    <span v-if="error" class="text-red-500 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>
