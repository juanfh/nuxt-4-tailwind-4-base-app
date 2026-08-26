<script setup lang="ts">

const { public: { captchaSiteKey } } = useRuntimeConfig()

let interval: ReturnType<typeof setInterval> | undefined
let script: HTMLScriptElement | undefined

const removeDuplicateElements = () => {
  const metaTags = Array.from(document.querySelectorAll('meta[http-equiv="origin-trial"]'))
  if (metaTags.length > 1) {
    metaTags.slice(-1).forEach(meta => meta.remove())
  }

  const apiScripts = Array.from(
    document.querySelectorAll('script[src^="https://www.google.com/recaptcha/api.js?render"]'),
  )
  if (apiScripts.length > 1) {
    apiScripts.slice(-1).forEach(el => el.remove())
  }

  const releaseScripts = Array.from(
    document.querySelectorAll('script[src^="https://www.gstatic.com/recaptcha/releases"]'),
  )
  if (releaseScripts.length > 1) {
    releaseScripts.slice(-1).forEach(el => el.remove())
  }
}

onMounted(() => {
  removeDuplicateElements()

  script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${captchaSiteKey}`
  script.async = true
  script.defer = true
  document.body.appendChild(script)

  interval = setInterval(() => {
    removeDuplicateElements()
  }, 500)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  removeDuplicateElements()
  script?.remove()
})
</script>

<template>
  <span hidden />
</template>
