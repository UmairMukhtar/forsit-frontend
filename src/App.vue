<template>
  <nav class="nav-bar">
    <h1>Forsit Product Management!</h1>
    <RouterLink to="/" class="router-link">Dashboard</RouterLink>
    <RouterLink to="/products" class="router-link">Products</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
<script>
import './styles/header.css'
</script>