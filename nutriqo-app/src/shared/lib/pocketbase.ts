import PocketBase from 'pocketbase';

// create a single shared PocketBase client instance
// the URL should be configured via environment variable
const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(pbUrl);

export default pb;
