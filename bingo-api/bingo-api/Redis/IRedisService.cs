namespace bingo_api.Redis
{
    public interface IRedisService
    {
        void Enqueue(string queueName, string item);
        string Dequeue(string queueName);
        long GetQueueLength(string queueName);
        Task SetAsync(string key, string value, TimeSpan? expiry = null);
        Task<string?> GetAsync(string key);
    }
}
