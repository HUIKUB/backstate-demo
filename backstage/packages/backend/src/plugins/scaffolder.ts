import { scaffolderModule } from '@backstage/plugin-scaffolder-backend/alpha';
import { createBuiltinActions } from '@backstage/plugin-scaffolder-backend';
import { waitTemplate } from '../../plugins/scaffolder-backend/src/actions/wait'; // หรือ path ของคุณ

export const scaffolder = scaffolderModule({
  register(env) {
    env.registerInit({
      deps: {
        router: env.router,
        config: env.config,
        logger: env.logger,
        database: env.database,
        reader: env.reader,
        discovery: env.discovery,
        identity: env.identity,
        catalogClient: env.catalogClient,
        scmIntegrations: env.scmIntegrations,
      },
      async init({
        router,
        config,
        logger,
        database,
        reader,
        discovery,
        identity,
        catalogClient,
        scmIntegrations,
      }) {
        const builtinActions = createBuiltinActions({
          config,
          integrations: scmIntegrations,
          reader,
          catalogClient,
        });

        const { createRouter } = await import(
          '@backstage/plugin-scaffolder-backend'
        );

        return await createRouter({
          logger,
          config,
          database,
          reader,
          identity,
          catalogClient,
          actions: [
            ...builtinActions,
            waitTemplate, // 👈 ใส่ custom action ที่คุณสร้างไว้
          ],
          scmIntegrations,
        });
      },
    });
  },
});
