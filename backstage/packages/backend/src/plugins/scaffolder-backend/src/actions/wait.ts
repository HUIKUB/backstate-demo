import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const waitTemplate = createTemplateAction<{
  reason?: string;
  timeout?: number;
}>({
  id: 'wait:template',
  description: 'Waits for manual approval before proceeding',
  schema: {
    input: {
      type: 'object',
      properties: {
        reason: {
          title: 'Reason',
          type: 'string',
        },
        timeout: {
          title: 'Timeout (seconds)',
          type: 'number',
        },
      },
    },
  },
  async handler(ctx) {
    const timeout = ctx.input.timeout || 3600;

    ctx.logger.info(
      `⏳ Waiting for manual approval: ${ctx.input.reason || 'no reason'}`,
    );

    return new Promise(resolve => {
      setTimeout(() => {
        ctx.logger.info('✅ Proceeding after wait');
        resolve(undefined);
      }, timeout * 1000);
    });
  },
});
