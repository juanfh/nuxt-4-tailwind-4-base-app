// Port de src/hooks/use-file-upload.ts (Next). `formatBytes` (shared/utils/)
// llega auto-importado, sin sentencia import — igual que `isAdminRole`/
// `getInitials` en el resto del proyecto. Adaptado a la Composition
// API en vez del par `[state, actions]` de React: en vez de `getInputProps()`
// (helper de React para esparcir props + ref sobre un <input> nativo, sin
// equivalente idiomático en Vue) el propio componente consumidor
// (ImageUploader.vue) enlaza `inputRef`/`accept`/`multiple` directo en su
// `<template>` vía `ref`/`v-bind`. El resto de la lógica (validación,
// previews, drag&drop) es un port literal.
export interface FileMetadata {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export interface FileWithPreview {
  file: File | FileMetadata
  id: string
  preview?: string
}

export interface FileUploadMessages {
  invalidFileType?: (params: { fileName: string }) => string
  fileTooLarge?: (params: { maxSize: string }) => string
  someFileTooLarge?: (params: { maxSize: string }) => string
  maxFilesExceeded?: (params: { maxFiles: number }) => string
}

export interface FileUploadOptions {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void
  onError?: (errors: string[]) => void
  messages?: FileUploadMessages
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
    onError,
    messages,
  } = options

  const files = ref<FileWithPreview[]>(initialFiles.map(file => ({
    file,
    id: file.id,
    preview: file.url,
  })))
  const isDragging = ref(false)
  const errors = ref<string[]>([])

  const inputRef = ref<HTMLInputElement | null>(null)

  const validateFile = (file: File | FileMetadata): string | null => {
    if (file.size > maxSize) {
      return messages?.fileTooLarge?.({ maxSize: formatBytes(maxSize) })
        ?? `File exceeds the maximum size of ${formatBytes(maxSize)}.`
    }

    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileType = file instanceof File ? (file.type ?? '') : file.type
      const fileExtension = `.${file.name.split('.').pop()}`

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase()
        }
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(`${baseType}/`)
        }
        return fileType === type
      })

      if (!isAccepted) {
        return messages?.invalidFileType?.({ fileName: file.name })
          ?? `File "${file.name}" is not an accepted file type.`
      }
    }

    return null
  }

  const createPreview = (file: File | FileMetadata): string | undefined => {
    if (file instanceof File) {
      return URL.createObjectURL(file)
    }
    return file.url
  }

  const generateUniqueId = (file: File | FileMetadata): string => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    return file.id
  }

  const clearFiles = () => {
    for (const file of files.value) {
      if (file.preview && file.file instanceof File && file.file.type.startsWith('image/')) {
        URL.revokeObjectURL(file.preview)
      }
    }

    if (inputRef.value) {
      inputRef.value.value = ''
    }

    files.value = []
    errors.value = []
  }

  const addFiles = (newFiles: FileList | File[]) => {
    if (!newFiles || newFiles.length === 0) return

    const newFilesArray = Array.from(newFiles)
    const newErrors: string[] = []

    errors.value = []

    if (!multiple) {
      clearFiles()
    }

    if (multiple && maxFiles !== Number.POSITIVE_INFINITY && files.value.length + newFilesArray.length > maxFiles) {
      newErrors.push(
        messages?.maxFilesExceeded?.({ maxFiles }) ?? `You can only upload a maximum of ${maxFiles} files.`,
      )
      onError?.(newErrors)
      errors.value = newErrors
      return
    }

    const validFiles: FileWithPreview[] = []

    for (const file of newFilesArray) {
      if (multiple) {
        const isDuplicate = files.value.some(
          existingFile => existingFile.file.name === file.name && existingFile.file.size === file.size,
        )
        if (isDuplicate) continue
      }

      if (file.size > maxSize) {
        newErrors.push(
          multiple
            ? (messages?.someFileTooLarge?.({ maxSize: formatBytes(maxSize) }) ?? `Some files exceed the maximum size of ${formatBytes(maxSize)}.`)
            : (messages?.fileTooLarge?.({ maxSize: formatBytes(maxSize) }) ?? `File exceeds the maximum size of ${formatBytes(maxSize)}.`),
        )
        continue
      }

      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      }
      else {
        validFiles.push({
          file,
          id: generateUniqueId(file),
          preview: createPreview(file),
        })
      }
    }

    if (validFiles.length > 0) {
      onFilesAdded?.(validFiles)
      files.value = multiple ? [...files.value, ...validFiles] : validFiles
      errors.value = newErrors
      onFilesChange?.(files.value)
    }
    else if (newErrors.length > 0) {
      onError?.(newErrors)
      errors.value = newErrors
    }

    if (inputRef.value) {
      inputRef.value.value = ''
    }
  }

  const removeFile = (id: string) => {
    const fileToRemove = files.value.find(file => file.id === id)
    if (fileToRemove?.preview && fileToRemove.file instanceof File && fileToRemove.file.type.startsWith('image/')) {
      URL.revokeObjectURL(fileToRemove.preview)
    }

    files.value = files.value.filter(file => file.id !== id)
    errors.value = []
    onFilesChange?.(files.value)
  }

  const clearErrors = () => {
    errors.value = []
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.currentTarget instanceof Node && e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) {
      return
    }

    isDragging.value = false
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    if (inputRef.value?.disabled) return

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      if (!multiple) {
        const file = e.dataTransfer.files[0]
        if (file) addFiles([file])
      }
      else {
        addFiles(e.dataTransfer.files)
      }
    }
  }

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      addFiles(target.files)
    }
  }

  const openFileDialog = () => {
    inputRef.value?.click()
  }

  return {
    files,
    isDragging,
    errors,
    inputRef,
    addFiles,
    removeFile,
    clearFiles,
    clearErrors,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    openFileDialog,
  }
}
