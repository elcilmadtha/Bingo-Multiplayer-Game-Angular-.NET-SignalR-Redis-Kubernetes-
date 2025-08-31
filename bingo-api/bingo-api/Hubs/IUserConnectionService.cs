namespace bingo_api.Hubs
{
    public interface IUserConnectionService
    {
        void AddOrUpdate(string username, string connectionId);
        bool TryGetConnectionId(string username, out string connectionId);
        void Remove(string username);
    }
}
