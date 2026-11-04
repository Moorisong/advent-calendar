const USER_KEY = 'mock-user';
const CALENDAR_KEY = 'mock-calendars';
const MESSAGE_KEY = 'mock-messages';
const read = (key, fallback) => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let observer = () => {};

function query(table, operation, payload) {
  const filters = [];
  let rowLimit = Infinity;
  let ordering = [];
  const builder = {
    eq(column, value) {
      filters.push([column, value]);
      return builder;
    },
    select() {
      if (operation === 'delete') {
        if (table !== 'calendars') {
          return Promise.resolve(resolve({ data: null, error: { code: '42501' } }));
        }
        const user = read(USER_KEY, null);
        const matched = rows.filter((row) =>
          row.owner_id === user?.id && filters.every(([key, value]) => row[key] === value));
        write(CALENDAR_KEY, rows.filter((row) => !matched.includes(row)));
        const gifts = read(MESSAGE_KEY, []);
        write(MESSAGE_KEY, gifts.filter((gift) => !matched.some((row) => row.id === gift.calendar_id)));
        return Promise.resolve(resolve({ data: matched, error: null }));
      }
      if (operation === 'insert' || operation === 'delete') {
        return builder;
      }
      return query(table, 'select');
    },
    async single() {
      const result = await builder;
      return { data: result.data?.[0] ?? null, error: result.error };
    },
    async maybeSingle() {
      const result = await builder;
      return { data: result.data?.[0] ?? null, error: result.error };
    },
    order(column, { ascending = true } = {}) {
      ordering.push([column, ascending]);
      return builder;
    },
    limit(value) {
      rowLimit = value;
      return builder;
    },
    then(resolve) {
      const collectionKey = table === 'calendars' ? CALENDAR_KEY : MESSAGE_KEY;
      const rows = read(collectionKey, []);
      if (operation === 'insert') {
        if (table === 'calendars' && rows.some((row) => row.owner_id === payload.owner_id)) {
          return Promise.resolve(resolve({
            data: null,
            error: { code: '23505', message: 'Only one calendar is allowed per account' },
          }));
        }
        const record = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...payload,
        };
        rows.push(record);
        write(collectionKey, rows);
        return Promise.resolve(resolve({ data: [record], error: null }));
      }
      const filtered = rows.filter((row) => filters.every(([key, value]) => row[key] === value));
      filtered.sort((a, b) => {
        for (const [column, ascending] of ordering) {
          const comparison = String(a[column] ?? '').localeCompare(String(b[column] ?? ''));
          if (comparison !== 0) {
            return ascending ? comparison : -comparison;
          }
        }
        return 0;
      });
      return Promise.resolve(resolve({ data: filtered.slice(0, rowLimit), error: null }));
    },
  };
  return builder;
}

export function createClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: read(USER_KEY, null) }, error: null };
      },
      async signInWithOAuth({ provider }) {
        const user = { id: provider === 'kakao' ? 'owner-123' : 'friend-456' };
        write(USER_KEY, user);
        location.assign('/auth/callback?code=mock-oauth-code');
        return { error: null };
      },
      async exchangeCodeForSession() {
        return { error: null };
      },
      async signOut() {
        localStorage.removeItem(USER_KEY);
        observer('SIGNED_OUT', null);
        return { error: null };
      },
      onAuthStateChange(callback) {
        observer = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
    from(table) {
      return {
        select() {
          return query(table, 'select');
        },
        insert(payload) {
          return query(table, 'insert', payload);
        },
        delete() {
          return query(table, 'delete');
        },
      };
    },
  };
}
