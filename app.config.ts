import type { ExpoConfig } from 'expo/config'
import appJson from './app.json'

const appConfig = appJson.expo as ExpoConfig

export default (): ExpoConfig => ({
  ...appConfig,
  extra: {
    ...appConfig.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
  },
})
