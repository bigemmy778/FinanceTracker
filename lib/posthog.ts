import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

type PostHogExtra = {
  posthogProjectToken?: string
  posthogHost?: string
}

const extra = Constants.expoConfig?.extra as PostHogExtra | undefined
const projectToken = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (__DEV__ && !projectToken) {
  console.error(
    new Error(
      'POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_PROJECT_TOKEN is configured',
    ),
  )
}

if (__DEV__ && !host) {
  console.error(
    new Error(
      'POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured',
    ),
  )
}

export const posthog = projectToken && host
  ? new PostHog(projectToken, {
      host,
      captureAppLifecycleEvents: true,
      preloadFeatureFlags: true,
      logs: {
        serviceName: 'native-recurry-app',
        serviceVersion: Constants.expoConfig?.version,
        environment: __DEV__ ? 'development' : 'production',
      },
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
        },
      },
    })
  : null

export const posthogLogger = {
  info: (message: string, attributes: Record<string, string | number | boolean>) => {
    posthog?.logger.info(message, attributes)
  },
}
