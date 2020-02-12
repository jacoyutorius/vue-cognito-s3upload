<template>
  <amplify-authenticator v-bind:authConfig="authConfig"></amplify-authenticator>
</template>

<script>
import { components } from "aws-amplify-vue";

export default {
  data: () => {
    return {
      authConfig: {
        signUpConfig: {
          signUpFields: [
            {
              label: "Email",
              key: "email",
              required: true,
              type: "string"
            }
          ]
        }
      }
    };
  }
};
</script>