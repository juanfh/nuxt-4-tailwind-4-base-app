export const CACHE_TIMES = {
  STATIC: 3600, // 1 hour - static content
  DYNAMIC: 60, // 1 minute - dynamic content
  REALTIME: 0, // No cache - real-time data
  USER_DATA: 30, // 30 seconds - user data
}

export const TIMEOUTS = {
  FAST: 3000, // 3 seconds - for quick responses
  NORMAL: 8000, // 8 seconds - standard timeout
  SLOW: 15000, // 15 seconds - for slower responses
}
