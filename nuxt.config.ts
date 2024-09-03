// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    runtimeConfig: {
        public: {
            surrealdb_host: 'ws://localhost:3001/rpc',
            surrealdb_ns: 'test',
            surrealdb_db: 'test',
        }
    },

    devtools: {enabled: true},
    modules: ["nuxt-oidc-auth"],
    oidc: {
        defaultProvider: 'oidc',

        // Config reference: https://github.com/itpropro/nuxt-oidc-auth/tree/main#providers
        providers: {
            oidc: {

                // FIXME: Set your URLs
                // In theory the base_url paramter would take care of those but this
                // mechanism failed in various tests. So just set your URLs here for
                // the time being.
                authorizationUrl: 'https://auth.geber.io/application/o/authorize/',
                tokenUrl: 'https://auth.geber.io/application/o/token/',
                userinfoUrl: 'https://auth.geber.io/application/o/userinfo/',
                logoutUrl: 'https://auth.geber.io/application/o/surreal/end-session/',
                redirectUri: 'http://localhost:3000/auth/oidc/callback',

                // FIXME: These values must be set but should come out of the .env file
                // TO set them up set:
                // NUXT_OIDC_PROVIDERS_OIDC_CLIENT_ID
                // NUXT_OIDC_PROVIDERS_OIDC_CLIENT_SECRET
                clientId: '',
                clientSecret: '',

                // This disables the need for `openIdConfiguration`
                validateAccessToken: true,
                validateIdToken: true,

                // Set to true for the raw token to be available in the frontend
                // Required for the surrealdb example to work
                exposeAccessToken: true,

                // Request additional user information instead of just some ID
                // scope: ['openid', 'profile', 'email'],
                scope: ['openid', 'profile', 'email', 'surrealdb', 'offline_access'],
                scopeInTokenRequest: false,

                // Optional stuff that may come in handy

                audience: '5X2x9Y6gMxIotHL83asit8HjVZcRg31y4YVWEGzB',
                // grantType: 'authorization_code',
                // tokenRequestType: 'form-urlencoded',
                // authenticationScheme: 'header',

                openIdConfiguration: {
                    "issuer": "https://auth.geber.io/application/o/surreal/",
                    "authorization_endpoint": "https://auth.geber.io/application/o/authorize/",
                    "token_endpoint": "https://auth.geber.io/application/o/token/",
                    "userinfo_endpoint": "https://auth.geber.io/application/o/userinfo/",
                    "end_session_endpoint": "https://auth.geber.io/application/o/surreal/end-session/",
                    "introspection_endpoint": "https://auth.geber.io/application/o/introspect/",
                    "revocation_endpoint": "https://auth.geber.io/application/o/revoke/",
                    "device_authorization_endpoint": "https://auth.geber.io/application/o/device/",
                    "response_types_supported": [
                        "code",
                        "id_token",
                        "id_token token",
                        "code token",
                        "code id_token",
                        "code id_token token"
                    ],
                    "response_modes_supported": [
                        "query",
                        "fragment",
                        "form_post"
                    ],
                    "jwks_uri": "https://auth.geber.io/application/o/surreal/jwks/",
                    "grant_types_supported": [
                        "authorization_code",
                        "refresh_token",
                        "implicit",
                        "client_credentials",
                        "password",
                        "urn:ietf:params:oauth:grant-type:device_code"
                    ],
                    "id_token_signing_alg_values_supported": [
                        "RS256"
                    ],
                    "subject_types_supported": [
                        "public"
                    ],
                    "token_endpoint_auth_methods_supported": [
                        "client_secret_post",
                        "client_secret_basic"
                    ],
                    "acr_values_supported": [
                        "goauthentik.io/providers/oauth2/default"
                    ],
                    "scopes_supported": [
                        "surrealdb",
                        "openid",
                        "email",
                        "profile",
                        "offline_access"
                    ],
                    "request_parameter_supported": false,
                    "claims_supported": [
                        "sub",
                        "iss",
                        "aud",
                        "exp",
                        "iat",
                        "auth_time",
                        "acr",
                        "amr",
                        "nonce",
                        "email",
                        "email_verified",
                        "name",
                        "given_name",
                        "preferred_username",
                        "nickname",
                        "groups",
                        "https://surrealdb.com/ns",
                        "https://surrealdb.com/db",
                        "https://surrealdb.com/sc",
                        "https://surrealdb.com/tk",
                        "https://surrealdb.com/email",
                        "https://surrealdb.com/email_verified",
                        "https://surrealdb.com/name",
                        "https://surrealdb.com/nickname"
                    ],
                    "claims_parameter_supported": false,
                    "code_challenge_methods_supported": [
                        "plain",
                        "S256"
                    ]
                }
            }
        },
        session: {
            // Those need to be false, otherwise the login will fail (why?)
            // Might need some of that nitro persistence (see below)
            // https://github.com/itpropro/nuxt-oidc-auth/issues/10
            expirationCheck: true,
            automaticRefresh: true,
            expirationThreshold: 10,
        },
        middleware: {

            // Seems to allow hooking into the callback to mess around with the response.
            // Untested
            globalMiddlewareEnabled: false,

            // Enables the creaton of a custom login page via /auth/login
            // No username / password but really just another button from what I get.
            customLoginPage: false,
        },
    },
    nitro: {
        preset: 'node-server',
        storage: { // Local file system storage for demo purposes
            oidc: {
                driver: 'fs',
                base: './tmp/oidcstorage'
            }
        }
    },
})