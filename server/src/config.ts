import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads dir relative to the server source directory (server/src/ -> server/uploads/)
// This ensures consistency regardless of process.cwd()
export const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
