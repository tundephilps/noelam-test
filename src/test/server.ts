import { setupServer } from 'msw/node';

import { handlers } from '@/mocks/handlers';

/** Node-side MSW server sharing the browser handlers. */
export const server = setupServer(...handlers);
