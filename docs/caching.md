# Caching

Redis usage:
- `user:plan:{userId}` for plan status
- Analytics aggregation caches
- TTL defaults: 24h on plan cache
- Invalidation on `payment.captured` webhook
