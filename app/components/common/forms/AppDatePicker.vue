<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'
import { format, type Locale } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { CalendarIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  label: string
  value?: Date
  required?: boolean
  onChange: (date: Date | undefined) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecciona una fecha',
})

// @nuxtjs/i18n expone el alias corto (es/en, ver routing.ts) como locale.value
// — a diferencia de next-intl en el original, que exponía el locale completo
// (es-ES/en-US) vía useLocale(). Se mapea directo sobre el alias corto en vez
// de resolver localeProperties.iso, con el mismo resultado (solo hay 2 locales).
const localeMap: Record<string, { locale: Locale, format: string, weekStartsOn: 0 | 1 }> = {
  es: { locale: es, format: 'dd/MM/yyyy', weekStartsOn: 1 },
  en: { locale: enUS, format: 'MM/dd/yyyy', weekStartsOn: 0 },
}
const { locale } = useI18n()
const dateFnsLocale = computed(() => localeMap[locale.value] ?? localeMap.es)

const open = ref(false)

// El Calendar de shadcn-vue (sobre reka-ui) trabaja con DateValue de
// @internationalized/date, no con Date nativo — a diferencia del original
// (react-day-picker + date-fns, ambos sobre Date). Se convierte en el borde
// del componente para mantener la API pública (value/onChange) en Date, igual
// que el original.
const toCalendarDate = (date?: Date): CalendarDate | undefined => {
  if (!date) return undefined
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

const toJsDate = (date?: DateValue | null): Date | undefined => {
  if (!date) return undefined
  return new Date(date.year, date.month - 1, date.day)
}

const calendarValue = computed(() => toCalendarDate(props.value))
const calendarMin = computed(() => toCalendarDate(props.minDate) ?? new CalendarDate(1945, 1, 1))
const calendarMax = computed(() => toCalendarDate(props.maxDate) ?? toCalendarDate(new Date()))

const handleSelect = (date: DateValue | undefined) => {
  props.onChange(toJsDate(date))
  open.value = false
}
</script>

<template>
  <div class="w-full">
    <Label v-if="label !== undefined" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <div class="relative">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button
            :id="id"
            variant="outline"
            :class="cn(
              'w-full justify-between text-left font-normal bg-form-item-bg',
              error
                ? 'border-red-500 focus:border-red-500'
                : open
                  ? 'border-primary-500'
                  : 'border-form-item-border focus:border-primary-500',
            )"
            :disabled="disabled"
          >
            <template v-if="value">{{ format(value, dateFnsLocale.format, { locale: dateFnsLocale.locale }) }}</template>
            <span v-else>{{ placeholder }}</span>
            <CalendarIcon class="mr-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="z-60 w-auto p-0 bg-form-item-bg border border-form-item-border rounded-lg overflow-hidden max-w-xs" align="start">
          <Calendar
            :model-value="calendarValue"
            layout="month-and-year"
            :min-value="calendarMin"
            :max-value="calendarMax"
            :week-starts-on="dateFnsLocale.weekStartsOn"
            :locale="locale"
            class="[&_select]:bg-form-item-bg [&_select]:pl-2"
            @update:model-value="handleSelect"
          />
        </PopoverContent>
      </Popover>
    </div>

    <span v-if="error" class="text-red-500 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>
