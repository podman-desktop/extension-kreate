<script lang="ts">
// app.css includes tailwind css dependencies that we use
import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { router } from 'tinro';
import Route from './lib/Route.svelte';
import { onMount } from 'svelte';
import { getRouterState } from './api/client';
import UseTemplate from './components/UseTemplate.svelte';
import Kreate from './Kreate.svelte';

// Using our router instance, we can determine if the application has been mounted.
router.mode.hash();
let isMounted = false;

onMount(() => {
  // Load router state on application startup
  const state = getRouterState();
  router.goto(state.url);
  isMounted = true;
});
</script>

<Route path="/*" breadcrumb="Kreate" isAppMounted={isMounted} let:meta>
  <main class="flex flex-col w-screen h-screen overflow-hidden bg-[var(--pd-content-bg)]">
    <div class="flex flex-row w-full h-full overflow-hidden">
      <Route path="/" breadcrumb="Kreate">
        <Kreate />
      </Route>
      <Route path="/template" breadcrumb="Use a template">
        <UseTemplate />
      </Route>
    </div>
  </main>
</Route>
