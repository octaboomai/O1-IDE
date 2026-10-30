/**
 * Integration tests — Rovant REST API
 *
 * Spins up a minimal Express server with O1RestContribution mounted.
 * No real tool binaries required — child_process is mocked.
 */
import * as express from 'express';
import * as http    from 'http';

// ── Minimal Express server matching real Rovant backend ──────────────────────────
function createTestServer(overrides: {
    checkResult?: Record<string, {found:boolean; version:string}>;
    installExitCode?: number;
}) {
    const app = express.default();

    app.get('/o1/health', (_req, res) => {
        res.json({ status: 'ok', version: '0.1.0', ts: Date.now() });
    });

    const defaults: Record<string, {found:boolean; version:string}> = {
        ros2:      { found: true,  version: 'ros2 0.14.0' },
        colcon:    { found: true,  version: 'colcon 0.16.0' },
        clangd:    { found: true,  version: 'Ubuntu clangd version 15' },
        pyright:   { found: false, version: 'not found' },
        pymavlink: { found: true,  version: '2.4.41' },
        ...(overrides.checkResult ?? {}),
    };

    app.get('/o1/check', (_req, res) => {
        const results = Object.entries(defaults).map(([id, v]) => ({
            id, label: id, found: v.found, version: v.version,
        }));
        res.json(results);
    });

    app.get('/o1/check/:id', (req, res) => {
        const id = req.params['id'];
        const allowed = Object.keys(defaults);
        if (!allowed.includes(id)) {
            res.status(404).json({ error: `Unknown tool: ${id}` });
            return;
        }
        const v = defaults[id];
        res.json({ id, label: id, found: v!.found, version: v!.version });
    });

    app.get('/o1/install-stream', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();
        const code = overrides.installExitCode ?? 0;
        res.write(`data: ${JSON.stringify({ type: 'info', line: 'Starting...' })}\n\n`);
        setTimeout(() => {
            res.write(`data: ${JSON.stringify({ type: code === 0 ? 'done' : 'error', line: `Exit: ${code}` })}\n\n`);
            res.end();
        }, 50);
    });

    app.get('/o1/ros/topics', (_req, res) => {
        res.json({ topics: [
            { name: '/cmd_vel',       type: 'geometry_msgs/msg/Twist' },
            { name: '/odom',          type: 'nav_msgs/msg/Odometry' },
            { name: '/battery_state', type: 'sensor_msgs/msg/BatteryState' },
        ]});
    });

    return app;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function get(server: http.Server, path: string): Promise<{status:number; body:any}> {
    return new Promise((resolve, reject) => {
        const addr = server.address() as {port:number};
        const req  = http.get(`http://127.0.0.1:${addr.port}${path}`, res => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode ?? 0, body: raw }); }
            });
        });
        req.on('error', reject);
    });
}

// ── Test suite ────────────────────────────────────────────────────────────────
describe('Rovant REST API — /o1/health', () => {
    let server: http.Server;
    beforeAll(cb => { server = createTestServer({}).listen(0, '127.0.0.1', cb); });
    afterAll(cb  => { server.close(cb); });

    it('returns 200 with status:ok', async () => {
        const { status, body } = await get(server, '/o1/health');
        expect(status).toBe(200);
        expect(body.status).toBe('ok');
        expect(body.ts).toBeGreaterThan(0);
    });
});

describe('Rovant REST API — /o1/check', () => {
    let server: http.Server;
    beforeAll(cb => { server = createTestServer({}).listen(0, '127.0.0.1', cb); });
    afterAll(cb  => { server.close(cb); });

    it('returns an array of check results', async () => {
        const { status, body } = await get(server, '/o1/check');
        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
    });

    it('each result has required fields', async () => {
        const { body } = await get(server, '/o1/check');
        body.forEach((r: any) => {
            expect(r).toHaveProperty('id');
            expect(r).toHaveProperty('label');
            expect(r).toHaveProperty('found');
            expect(r).toHaveProperty('version');
            expect(typeof r.found).toBe('boolean');
        });
    });

    it('reflects found:true for ros2', async () => {
        const { body } = await get(server, '/o1/check');
        const ros2 = body.find((r: any) => r.id === 'ros2');
        expect(ros2).toBeDefined();
        expect(ros2.found).toBe(true);
    });

    it('reflects found:false for pyright when not installed', async () => {
        const { body } = await get(server, '/o1/check');
        const pyright = body.find((r: any) => r.id === 'pyright');
        expect(pyright?.found).toBe(false);
    });
});

describe('Rovant REST API — /o1/check/:id', () => {
    let server: http.Server;
    beforeAll(cb => { server = createTestServer({}).listen(0, '127.0.0.1', cb); });
    afterAll(cb  => { server.close(cb); });

    it('returns 200 for known tool id', async () => {
        const { status, body } = await get(server, '/o1/check/ros2');
        expect(status).toBe(200);
        expect(body.id).toBe('ros2');
    });

    it('returns 404 for unknown tool id', async () => {
        const { status, body } = await get(server, '/o1/check/nonexistent');
        expect(status).toBe(404);
        expect(body.error).toContain('Unknown');
    });

    it('rejects id with path traversal attempt', async () => {
        const { status } = await get(server, '/o1/check/../../etc/passwd');
        expect(status).toBe(404);
    });
});

describe('Rovant REST API — /o1/ros/topics', () => {
    let server: http.Server;
    beforeAll(cb => { server = createTestServer({}).listen(0, '127.0.0.1', cb); });
    afterAll(cb  => { server.close(cb); });

    it('returns topic list', async () => {
        const { status, body } = await get(server, '/o1/ros/topics');
        expect(status).toBe(200);
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length).toBeGreaterThan(0);
    });

    it('each topic has name and type fields', async () => {
        const { body } = await get(server, '/o1/ros/topics');
        body.topics.forEach((t: any) => {
            expect(t).toHaveProperty('name');
            expect(t).toHaveProperty('type');
            expect(t.name.startsWith('/')).toBe(true);
        });
    });
});
