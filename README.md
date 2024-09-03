# nuxt-xp-surreadb-oidc

> WIP :)

This example repo aims to authenticate against an OIDC provider using [nuxt-oidc-auth](https://nuxt.com/modules/nuxt-oidc-auth)
for the [nuxt](https://nuxt.com/) framework and then continues to authenticate against [SurrealDB](https://github.com/surrealdb/surrealdb)
using the Token.

This example uses [surrealdb.js](https://www.npmjs.com/package/surrealdb.js/). It may in principle work with [nuxt-surrealdb](https://github.com/Sandros94/nuxt-surrealdb).

## Versions used

* Authentik 2024.6.3
* SurrealDB 1.5.4
* Nuxt 3.12.4
* NodeJS 22.3.0

I used [authentik](https://goauthentik.io/) as the OIDC provider.

> Please be aware that SurrealDB v2 may differ in the way it integrates token auth.

## Usage

Configure your oidc settings in `nuxt.config.ts` and `.env`. Env may contain:

```
NUXT_OIDC_PROVIDERS_OIDC_CLIENT_SECRET=
NUXT_OIDC_PROVIDERS_OIDC_CLIENT_ID=

NUXT_OIDC_AUTH_SESSION_SECRET=
NUXT_OIDC_TOKEN_KEY=
NUXT_OIDC_SESSION_SECRET=
```

`NUXT_OIDC_AUTH_SESSION_SECRET`, `NUXT_OIDC_TOKEN_KEY` and `NUXT_OIDC_SESSION_SECRET` are optional. When nuxt starts it will suggest auto generated values to be added.

If changes to your `.env` file don't work consider adding `--dotenv <NameOfYourEnvFile>` to your run command.

> An existing installation of surrealdb is required.

Start the complete setup with surrealdb and nuxt:

```bash
npm install
npm run dev
```

The example is configured to spin up a local instance in memory instance of surrealdb served on Port `3001`. Changes will not persist. The surql files are imported automatically at startup.

If you prefer to use another surrealdb instance you can of course do so. Example:

```bash
npm run dev:nuxt

# Import surql files
find _surql/ -maxdepth 1 -iname "*.surql" -exec surreal import --conn <SURREALDB_HOST> --user root --pass root --ns test --db test {} \;
```

### Additional configuration

You can change various configuration variables in the `.env` file. See `.env.example` for inspiration.

In addition to that you may need to make some changes to `nuxt.config.ts`, `_surql/surrealdb1.surql` and potentially `_authentik/surrealdb1_scope.py`. Check for `FIXME` comments.

## Setting up Authentik

Create an application + OIDC provider. The OIDC provider must implement the `offline_access` scope in order to enable token refresh capabilities.

Add a custom scope under `Property Mappings`. I called it `surrealdb`. If you change the name just make sure to include the correct scope in the oidc config.

The mapping looks like this (also see `_authentik/surrealdb1_scope`):

```python
return {
    'https://surrealdb.com/ns': "test",
    'https://surrealdb.com/db': "test",
    'https://surrealdb.com/sc': "user",
    'https://surrealdb.com/tk': "authentik",
    'https://surrealdb.com/email': request.user.email,
    'https://surrealdb.com/email_verified': True,
    'https://surrealdb.com/name': request.user.name,
    'https://surrealdb.com/nickname': request.user.username,
}
```

Add that scope to the prover.

## Running the app

Run the app with `npm run dev` to start the nuxt app and SurrealDB. You can use `npm run dev:nuxt` and `npm run dev:surreal` separately if you prefer. The default address of the Nuxt app should be `http://localhost:3000`.

When you run it, open the JavaScript console to see more about what's going on. You may also follow the output of your SurrealDB log.

If authentication is performed successfully the user will be added if not found in the database. Else it's record will be pulled. Note that another test user created by importing the surql file will not be shown in the result (browser console) despite the query not limiting output. This is done by the permissions set in the database itself.

## In depth

### Nuxt vs SurrealDB

Configuration must be made on 

### Exposing the token

For this example to work `exposeAccessToken` must be set to `true`. It's used on the client side to make the SurrealDB connection.

This may cause a security risk. At this point I need to do more research on the potential risks. Just be aware that there might be a problem with that.

### SurrealDB v1 vs v2

This example is so far only set up for SurrealDB v1. It uses Scope and permissions to implement authentication. Version 2 has a new `DEFINE ACCESS` statement that should make things even easier.

> TODO: Add version 2 compatible examples

### On token refresh

To enable token refresh make sure to enable the `offline_access` scope in the authentik provider.

Configure `nitro` in `nuxt.config.ts`:

```javascript
nitro: {
        preset: 'node-server',
        storage: { // Local file system storage for demo purposes
            oidc: {
                driver: 'fs',
                base: './tmp/oidcstorage'
            }
        }
    }
```

* More about [nitro storage](https://nitro.unjs.io/guide/storage)

## Troubleshooting

### Error: openIdConfiguration is not a function

The nuxt oidc [configuration reference](https://nuxt.com/modules/nuxt-oidc-auth#oidc) explains this parameter as an object of a function.

The idea is to place the data from your OIDC provider's config URL here. Either by simply adding it or adding a function to download it automatically.

The configuration URL looks something like this: 

```
https://<YOUR_AUTHENTIK>/application/o/surreal/.well-known/openid-configuration
```

I've attempted to add a function here, but it was never picked up and actually went missing completely from the config object at the relevant spot. So at the moment, if the config is needed it's best to just add it directly to the config or consider storing it in a file.

Hint: You can use the nuxt `prebuild` hooks to download the data to json and then load them into your app directly.


## Additional resources

* SurrealDB [Auth0 example](https://github.com/surrealdb/examples/tree/main/auth0)
  * Corresponding [Blog Entry](https://surrealdb.com/docs/surrealdb/tutorials/integrate-auth0-as-authentication-provider) 
* [DEFINE TOKEN](https://surrealdb.com/docs/surrealdb/surrealql/statements/define/token) SurQL statement
* DEFINE TABLE [PERMISSIONS](https://surrealdb.com/docs/surrealdb/surrealql/statements/define/table#defining-permissions) section