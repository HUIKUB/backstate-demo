// import { createBackendModule } from '@backstage/backend-plugin-api';
// import {
//   DEFAULT_NAMESPACE,
//   stringifyEntityRef,
// } from '@backstage/catalog-model';
// import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
// import {
//   authProvidersExtensionPoint,
//   createOAuthProviderFactory,
// } from '@backstage/plugin-auth-node';

// export default createBackendModule({
//   pluginId: 'auth',
//   moduleId: 'githubProvider',
//   register(reg) {
//     reg.registerInit({
//       deps: { providers: authProvidersExtensionPoint },
//       async init({ providers }) {
//         providers.registerProvider({
//           providerId: 'github',
//           factory: createOAuthProviderFactory({
//             authenticator: githubAuthenticator,
//             async signInResolver({ result: { fullProfile } }, ctx) {
//               const userId = fullProfile.username;
//               if (!userId) {
//                 throw new Error(
//                   `GitHub user profile does not contain a username`,
//                 );
//               }

//               const userEntityRef = stringifyEntityRef({
//                 kind: 'User',
//                 name: userId,
//                 namespace: DEFAULT_NAMESPACE,
//               });

//               return ctx.issueToken({
//                 claims: {
//                   sub: userEntityRef,
//                   ent: [userEntityRef],
//                 },
//               });
//             },
//           }),
//         });
//       },
//     });
//   },
// });