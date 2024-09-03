<template>
<div>

  <h3>OIDC Auth with Nuxt & SurrealDB</h3>

  <p>To see the full result don't forget to open your browser console.</p>

  <hr>

  <div>
    <h4>Authentication</h4>
    <p>
      <button @click="login('oidc')">Login</button>
      <button @click="refresh()">Refresh Token</button>
      <button @click="logout('oidc')">Logout</button>
    </p>
    <p>
      <strong>Logged in:</strong> {{loggedIn}}
    </p>
    <div v-if="loggedIn">

      <p>
        User Data:<br>
        <textarea style="width: 100%; height: 20rem">{{user}}</textarea>
      </p>
      <p>
        Token:<br>
        <textarea style="width: 100%; height: 10rem">{{user.accessToken}}</textarea>
      </p>
    </div>
  </div>

</div>
</template>

<script setup>
const {loggedIn, user, login, logout, refresh} = useOidcAuth()

const rtconfig = useRuntimeConfig()
const surrealdb_url = rtconfig.public.surrealdb_host
const surrealdb_ns = rtconfig.public.surrealdb_ns
const surrealdb_db = rtconfig.public.surrealdb_db

const surrealdb_connected = ref(false)
const surrealdb_authenticated = ref(false)

import Surreal from "surrealdb.js";

// Quick and dirty surrealdb connection.
// Check my nuxt implementation of stickies for a better integration:
// https://github.com/rgeber/nuxtjs-surrealdb-stickies
//
// Or consider using nuxt-surrealdb (didn't test yet)
// https://github.com/Sandros94/nuxt-surrealdb

const connect_surreadb = async () => {
  if (loggedIn === false || typeof  user.value === "undefined" || typeof user.value.accessToken === "undefined") {
    console.log('Not authenticated')
    return
  }

  // Extract token
  const auth_token = user.value.accessToken

  // Connect to database
  console.log('Attempting to connect to SurrealDB')
  console.log('SurrealDB host', surrealdb_url)
  console.log('SurrealDB NS', surrealdb_ns)
  console.log('SurrealDB DB', surrealdb_db)
  const db = new Surreal()
  surrealdb_connected.value = await db.connect(surrealdb_url)
  await db.use({
    namespace: surrealdb_ns,
    database: surrealdb_db
  })


  // Authenticate against token
  console.log('Attempting token authentication.')
  surrealdb_authenticated.value = await db.authenticate(auth_token)
  console.log('Authentication result', surrealdb_authenticated.value)

  // Check if the user is already in the database
  // No where clause is needed as select is limited to the logged in user
  // by the SurrealDB permission
  const existing_user = await db.query("SELECT * FROM user")
  if (existing_user[0]['length'] > 0) {
    console.log('Found existing user in database.', existing_user[0][0])
  } else {

    const new_user = {
      name: user.value.providerInfo.given_name,
      email: user.value.providerInfo.email,
      nickname: user.value.providerInfo.preferred_username
    }

    console.log('User does not exist in database. Attempting to create.', new_user)

    // const user_creation_result = await db.query('INSERT INTO user SET name = type::string($name), email = type::string(email), nickname = type::string(nickname)', new_user)
    const user_creation_result = await db.create('user', new_user)
  }

  const user_list = await db.query("SELECT * FROM user")
  console.log('User list (should only be authenticated user)', user_list)

}

// Watching the user value for changes.
watch(user, async (nv, ov) => {
  console.log(nv, ov)
  await connect_surreadb()
}, {
  deep: true
})

// Attempt to connect to surreadb on load
onBeforeMount(async () => {
  await connect_surreadb()
})

</script>
