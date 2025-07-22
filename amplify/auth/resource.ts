import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    given_name: {
      required: false,
      mutable: true,
    },
    family_name: {
      required: false,
      mutable: true,
    },
    preferred_username: {
      required: false,
      mutable: true,
    },
  },
  accountRecovery: "EMAIL_ONLY",
  multifactor: {
    mode: "OPTIONAL",
    totp: true,
  },
});
