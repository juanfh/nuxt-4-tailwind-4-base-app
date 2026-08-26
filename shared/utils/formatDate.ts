import type { Locale } from 'date-fns'
import { format as formatWithDateFns } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

// Adaptación (no port literal) de src/utils/formatDate.ts (Next), que usa
// Luxon. Este proyecto ya trae `date-fns` como dependencia (Fase 7,
// AppDatePicker) — añadir Luxon solo para esta función habría duplicado
// una librería de fechas sin necesidad real. Los patrones de formato
// (tokens CLDR-like) coinciden entre Luxon y date-fns para los casos usados
// aquí, así que se preservan literales. `formatNow`/`formatFromUTCDate` no se
// portan (sin consumidor todavía) — `toISODateTime`/`toISODateTimeEndOfDay`
// sí, añadidos en el port del dominio `news` (getNews.ts/addNew.ts,
// filtro de rango de fechas), también adaptados a Date nativo en vez de
// Luxon: reciben un string 'yyyy-MM-dd' (el que produce FormAppDatePicker,
// ver AppDatePicker.vue) y fijan la hora a inicio/fin de día en UTC.
export enum FormatDate {
  HOUR = 'hour',
  BASIC = 'basic',
  SHORT = 'short',
  LONG = 'long',
  COMPLETE = 'complete',
  UTC_Z = 'utc_z',
}

// Claves por alias corto (es/en), no ISO completo (es-ES/en-US): mismo
// criterio que `localeMap` en AppDatePicker.vue, porque @nuxtjs/i18n expone
// el alias corto vía `locale.value`, no el ISO completo que usaba next-intl.
const localeMap: Record<string, Record<FormatDate, string>> = {
  es: {
    [FormatDate.HOUR]: 'HH:mm',
    [FormatDate.BASIC]: 'yyyy-MM-dd',
    [FormatDate.SHORT]: 'dd/MM/yyyy',
    [FormatDate.LONG]: 'd LLL yyyy',
    [FormatDate.COMPLETE]: "cccc, d 'de' LLLL 'de' yyyy",
    [FormatDate.UTC_Z]: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },
  en: {
    [FormatDate.HOUR]: 'hh:mm a',
    [FormatDate.BASIC]: 'yyyy-MM-dd',
    [FormatDate.SHORT]: 'MM/dd/yyyy',
    [FormatDate.LONG]: 'LLL d, yyyy',
    [FormatDate.COMPLETE]: 'cccc, LLLL d, yyyy',
    [FormatDate.UTC_Z]: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },
}

const dateFnsLocaleMap: Record<string, Locale> = { es, en: enUS }

const DEFAULT_LOCALE = 'es'

interface FormatDateProps {
  date: string
  locale?: string
  format?: FormatDate
}

export const formatDate = ({ date, locale, format }: FormatDateProps): string => {
  const selectedLocale = locale ?? DEFAULT_LOCALE
  const formatString = localeMap[selectedLocale]?.[format ?? FormatDate.SHORT] ?? localeMap[DEFAULT_LOCALE]![FormatDate.SHORT]
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date
  return formatWithDateFns(parsedDate, formatString, { locale: dateFnsLocaleMap[selectedLocale] ?? dateFnsLocaleMap[DEFAULT_LOCALE] })
}

export const toISODateTime = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString()
}

export const toISODateTimeEndOfDay = (date: string): string => {
  const parsed = new Date(`${date}T23:59:59.999Z`)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString()
}
