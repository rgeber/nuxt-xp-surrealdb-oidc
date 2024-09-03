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
