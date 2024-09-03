-- ########################################################################
-- Specify the namespace and database that will be used.
-- These values should match the custom claims that we configured before.
USE NS test DB test;

-- Define the scope where the token will be used.
-- The name of the scope should match the custom claim that we configured before.
DEFINE SCOPE user;

-- Define the public key to verify tokens issued by Authentik for our application.
-- The name of the token should match the custom claim that we configured before.
-- FIXME: Add your authentication app JWKS URL
DEFINE TOKEN authentik ON SCOPE user TYPE JWKS VALUE "YOUR_JWKS_URL";



-- ########################################################################
DEFINE TABLE user SCHEMAFULL
  -- Authorized users can select, update, delete and create user records.
  -- Records that do not match the permissions will not be modified nor returned.
  PERMISSIONS FOR select, update, delete, create
  WHERE

    -- The token scope must match the scope that we defined.
    -- The name of the scope should match the scope that we defined before.
    $scope = "user"

    -- In authentik use the preview function of your provider to see the `aud` value.
    -- FIXME: Changer this to YOUR audience value
    AND $token.aud CONTAINS "YOUR_AUDIENCE_TOKEN"

    -- The email claim must match the email of the user being queried.
    AND email = $token['https://surrealdb.com/email']
    AND $token['https://surrealdb.com/email_verified'] = true
;

-- In this example, we will use the email as the primary identifier for a user.
DEFINE INDEX email ON user FIELDS email UNIQUE;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
-- We define some other information present in the token that we want to store.
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD nickname ON user TYPE string;

-- ########################################################################
-- Create a user that should never be visible to the token authenticated user
INSERT INTO user {
    email: "invisible_to_all@localhost",
    name: "Invisible user",
    nickname: "ghost"
};
