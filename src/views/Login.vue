<template>
  <b-row>
    <b-col md="6" offset-md="3">
      <b-card title="Login">
        <b-form @submit.prevent="handleSubmit">
          <b-form-group label="Username:" label-for="username">
            <b-form-input id="username" v-model="form.username" type="text" required :disabled="loading" autofocus></b-form-input>
          </b-form-group>

          <b-form-group label="Password:" label-for="password">
            <b-form-input id="password" v-model="form.password" type="password" required :disabled="loading"></b-form-input>
          </b-form-group>

          <b-alert v-if="error" variant="danger" show>
            {{ error }}
          </b-alert>

          <b-button type="submit" variant="primary" :disabled="loading" class="w-100">
            <b-spinner v-if="loading" small></b-spinner>
            {{ loading ? 'Logging in...' : 'Login' }}
          </b-button>
        </b-form>
      </b-card>
      <div class="mt-3 text-center">
        <!-- TODO: Translate this -->
        <p>Forgot your password?<router-link :to="{ name: 'passwordReset' }"> Reset it</router-link>.</p>
        <!-- TODO: Translate this -->
        <p>Not a member?<router-link :to="{ name: 'register' }"> Register</router-link>.</p>
        <p>
          Use of any LCO facilities and/or data implies acceptance of the
          <a href="https://lco.global/observatory/termsofservice/"> Terms of Service</a>.
        </p>
      </div>
    </b-col>
  </b-row>
</template>
<script>
export default {
  name: 'Login',
  props: {
    redirectPath: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;

      try {
        await this.loginUser();
        await this.loadProfile();
        this.redirectAfterLogin();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async loginUser() {
      const response = await fetch(`${this.$store.state.urls.observationPortalApi}/accounts/api-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // set cookies
        body: JSON.stringify(this.form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
    },
    async loadProfile() {
      try {
        await this.$store.dispatch('getProfileData');
      } catch (error) {
        throw new Error('Login successful but failed to load profile data. Please refresh the page.');
      }
    },
    redirectAfterLogin(){
      if (this.redirectPath) {
        this.$router.push({ name: this.redirectPath });
      } else {
        const redirectPath = this.$route.query.next || '/';
        this.$router.push(redirectPath);
      }
    }
  }
};
</script>
