import express, { Request, Response, Router } from 'express';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

const WEBHOOK_PATH = '/workflow';
const sseClients = new Map<string, Set<Response>>();

function createGithubWebhookRouter(): Router {
  const router = express.Router();

  router.use(express.json());

  router.post(WEBHOOK_PATH, (req: Request, res: Response) => {
    const event = req.headers['x-github-event'] as string | undefined;
    const body = req.body as any;

    console.log('[GitHub Webhook] Event:', event);

    // ----- ตรงนี้คือข้อมูลสำคัญที่เราจะ broadcast -----
    const repoSlug: string | undefined = body?.repository?.full_name; // "HUIKUB/backstate-nestjs-demo"
    const wfRun = body?.workflow_run;
    const payload = {
      repoSlug,
      runId: wfRun?.id,
      status: wfRun?.status,         // queued / in_progress / completed / ...
      conclusion: wfRun?.conclusion, // success / failure / null
      updatedAt: wfRun?.updated_at,
    };

    console.log('[GitHub Webhook] Payload:', payload);

    // broadcast ให้ client ที่ subscribe repo นี้อยู่
    if (repoSlug && sseClients.has(repoSlug)) {
      const clients = sseClients.get(repoSlug)!;
      const data = `data: ${JSON.stringify(payload)}\n\n`;
      for (const client of clients) {
        client.write(data);
      }
    }

    res.status(200).send('ok');
  });

  router.get('/events/:owner/:repo', (req: Request, res: Response) => {
    const repoSlug = `${req.params.owner}/${req.params.repo}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');

    if (!sseClients.has(repoSlug)) {
      sseClients.set(repoSlug, new Set());
    }
    const set = sseClients.get(repoSlug)!;
    set.add(res);

    console.log(`[SSE] client connected for repo ${repoSlug}, total: ${set.size}`);

    req.on('close', () => {
      set.delete(res);
      console.log(`[SSE] client disconnected for repo ${repoSlug}, total: ${set.size}`);
    });
  });

  router.get('/health', (_req, res) => {
    res.status(200).send('github-webhook OK');
  });

  return router;
}


export default createBackendPlugin({
  pluginId: 'github-webhook',

  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter }) {
        httpRouter.use(createGithubWebhookRouter());

        console.log(
          `[github-webhook] Plugin initialized. Listening on /api/github-webhook${WEBHOOK_PATH}`,
        );
      },
    });
  },
});
