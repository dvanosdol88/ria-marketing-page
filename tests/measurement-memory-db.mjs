// Transactional in-memory adapter for local tests; no real credentials or writes.
export function memoryDb(initial = {}) {
  const records = new Map(Object.entries(structuredClone(initial)));
  function merge(a, b) {
    const result = { ...a };
    for (const [k, v] of Object.entries(b)) result[k] = v && typeof v === "object" && !Array.isArray(v) ? merge(result[k] ?? {}, v) : v;
    return result;
  }
  const doc = (path) => ({ path, async get() { const value = records.get(path); return { exists: !!value, data: () => structuredClone(value) }; } });
  let queue = Promise.resolve();
  return { records, doc, runTransaction(callback) {
    const job = queue.then(async () => {
      const writes = [];
      const result = await callback({ get: (ref) => ref.get(), set: (ref, value, options) => writes.push([ref.path, value, options]) });
      for (const [path, value, options] of writes) records.set(path, options?.merge ? merge(records.get(path) ?? {}, value) : structuredClone(value));
      return result;
    });
    queue = job.catch(() => {});
    return job;
  } };
}
