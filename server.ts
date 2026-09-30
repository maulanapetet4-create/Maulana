import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import {
  getCloudSqlReports,
  getCloudSqlReportByIdOrToken,
  saveOrUpdateCloudSqlReport,
  deleteCloudSqlReport,
  clearAllCloudSqlReports,
  getOrCreateUser,
} from './src/db/reportsRepo.ts';
import { INITIAL_REPORTS } from './src/services/mockReports.ts';

const app = express();
const PORT = 3000;

// Enable CORS and disable cache on API routes so Mobile Phones (HP SPV & GM) always fetch real-time data
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.path.startsWith('/api/')) {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// Local JSON file backup fallback
const DATA_FILE = path.resolve(process.cwd(), 'reports_store.json');

const loadReportsFromFile = (): any[] => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading reports_store.json:', err);
  }
  return INITIAL_REPORTS;
};

const saveReportsToFile = (data: any[]): void => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reports_store.json:', err);
  }
};

// Seed Cloud SQL with existing reports if Cloud SQL is empty
async function initSeedCloudSql() {
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      const existing = await getCloudSqlReports();
      if (existing.length === 0) {
        console.log('Cloud SQL is empty. Seeding initial reports...');
        const toSeed = loadReportsFromFile();
        for (const rep of toSeed) {
          await saveOrUpdateCloudSqlReport(rep);
        }
        console.log(`Seeded Cloud SQL with ${toSeed.length} reports.`);
      } else {
        console.log(`Cloud SQL connected. Found ${existing.length} reports.`);
      }
    }
  } catch (err) {
    console.warn('Notice: Cloud SQL initialization check completed:', err);
  }
}

// User Sync API
app.post('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing user details' });
    }
    const user = await getOrCreateUser(uid, email, displayName, photoUrl);
    res.json({ success: true, user });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// API: Get all reports (from Cloud SQL first, with local fallback)
app.get('/api/reports', async (req, res) => {
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      const sqlReports = await getCloudSqlReports();
      if (sqlReports.length > 0) {
        return res.json(sqlReports);
      }
    }
  } catch (err) {
    console.warn('Cloud SQL query fallback to local store:', err);
  }
  const reports = loadReportsFromFile();
  res.json(reports);
});

// API: Get single report by ID or Token
app.get('/api/reports/:idOrToken', async (req, res) => {
  const { idOrToken } = req.params;
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      const sqlReport = await getCloudSqlReportByIdOrToken(idOrToken);
      if (sqlReport) {
        return res.json(sqlReport);
      }
    }
  } catch (err) {
    console.warn('Cloud SQL query single fallback to local store:', err);
  }

  const reports = loadReportsFromFile();
  const found = reports.find(
    (r) => r.id === idOrToken || r.supervisorToken === idOrToken || r.gmToken === idOrToken
  );
  if (!found) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(found);
});

// API: Create or update report (persists to both Cloud SQL and file backup)
app.post('/api/reports', async (req, res) => {
  const report = req.body;
  if (!report || !report.id) {
    return res.status(400).json({ error: 'Invalid report data' });
  }

  const now = new Date().toISOString();
  const updatedReport = {
    ...report,
    updatedAt: now,
  };

  // 1. Save to Cloud SQL
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      await saveOrUpdateCloudSqlReport(updatedReport);
    }
  } catch (err) {
    console.error('Error persisting to Cloud SQL:', err);
  }

  // 2. Save to local JSON store
  const reports = loadReportsFromFile();
  const index = reports.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    reports[index] = updatedReport;
  } else {
    reports.unshift(updatedReport);
  }
  saveReportsToFile(reports);

  res.json({ success: true, report: updatedReport });
});

// API: Delete single report
app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      await deleteCloudSqlReport(id);
    }
  } catch (err) {
    console.error('Error deleting in Cloud SQL:', err);
  }

  const reports = loadReportsFromFile();
  const filtered = reports.filter((r) => r.id !== id);
  saveReportsToFile(filtered);
  res.json({ success: true });
});

// API: Clear all reports
app.post('/api/reports/clear', async (req, res) => {
  try {
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      await clearAllCloudSqlReports();
    }
  } catch (err) {
    console.error('Error clearing Cloud SQL:', err);
  }
  saveReportsToFile([]);
  res.json({ success: true });
});

// Mount Vite middleware for dev or serve static dist in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    initSeedCloudSql();
  });
}

startServer();
