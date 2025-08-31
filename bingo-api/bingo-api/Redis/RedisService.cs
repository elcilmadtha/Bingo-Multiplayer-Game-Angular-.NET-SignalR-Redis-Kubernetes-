using StackExchange.Redis;

namespace bingo_api.Redis
{
    public class RedisService: IRedisService
    {
        private readonly IDatabase _db;

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public void Enqueue(string queueName, string item)
        {
            _db.ListRightPush(queueName, item);
        }

        public string Dequeue(string queueName)
        {
            return _db.ListLeftPop(queueName);
        }

        public long GetQueueLength(string queueName)
        {
            return _db.ListLength(queueName);
        }

        public async Task SetAsync(string key, string value, TimeSpan? expiry = null)
        {
            await _db.StringSetAsync(key, value, expiry);
        }

        public async Task<string?> GetAsync(string key)
        {
            return await _db.StringGetAsync(key);
        }
    }
}
