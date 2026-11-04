const USER_KEY = 'mock-user';
const CALENDAR_KEY = 'mock-calendars';
const MESSAGE_KEY = 'mock-messages';
const read = (key, fallback) => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let observer = () => {};

function query(table, operation, payload) {
  const filters = [];
  let rowLimit = Infinity;
  const ordering = [];
  const builder = {
    eq(column, value) {
      filters.push([column, value]);
      return builder;
    },
    select() {
      return builder;
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
      const user = read(USER_KEY, null);
      const matches = rows.filter((row) => filters.every(([key, value]) => row[key] === value));
      if (operation === 'delete') {
        const deleted = matches.filter((row) => table === 'calendars'
          ? row.owner_id === user?.id : row.sender_id === user?.id);
        write(collectionKey, rows.filter((row) => !deleted.includes(row)));
        if (table === 'calendars') {
          const gifts = read(MESSAGE_KEY, []);
          write(MESSAGE_KEY, gifts.filter((gift) => !deleted.some((row) => row.id === gift.calendar_id)));
        }
        return Promise.resolve(resolve({ data: deleted, error: null }));
      }
      if (operation === 'update') {
        const updated = matches.filter((row) => row.sender_id === user?.id);
        for (const row of updated) {
          Object.assign(row, payload);
        }
        write(collectionKey, rows);
        return Promise.resolve(resolve({ data: updated, error: null }));
      }
      if (operation === 'insert') {
        const duplicateOwner = table === 'calendars'
          && rows.some((row) => row.owner_id === payload.owner_id);
        const duplicateMessage = table === 'messages'
          && rows.some((row) => row.calendar_id === payload.calendar_id
            && row.gift_date === payload.gift_date && row.sender_id === user?.id);
        if (duplicateOwner || duplicateMessage) {
          return Promise.resolve(resolve({ data: null, error: { code: '23505' } }));
        }
        const record = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...payload,
          ...(table === 'messages' ? { sender_id: user?.id } : {}),
        };
        rows.push(record);
        write(collectionKey, rows);
        return Promise.resolve(resolve({ data: [record], error: null }));
      }
      const filtered = matches.filter((row) => table !== 'messages'
        || (row.sender_id === user?.id || read(CALENDAR_KEY, []).some((calendar) =>
          calendar.id === row.calendar_id && calendar.owner_id === user?.id)));
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
    rpc(name, args) {
      if (name !== 'get_my_message') {
        return Promise.resolve({ data: null, error: { message: 'Unknown RPC' } });
      }
      const user = read(USER_KEY, null);
      const matches = read(MESSAGE_KEY, []).filter((row) =>
        row.calendar_id === args.p_calendar_id && row.gift_date === args.p_gift_date
        && row.sender_id === user?.id);
      return Promise.resolve({
        data: matches.map(({ id, chocolate_type, body }) => ({ id, chocolate_type, body })),
        error: null,
      });
    },
    from(table) {
      return {
        select() {
          return query(table, 'select');
        },
        insert(payload) {
          return query(table, 'insert', payload);
        },
        update(payload) {
          return query(table, 'update', payload);
        },
        delete() {
          return query(table, 'delete');
        },
      };
    },
  };
}
