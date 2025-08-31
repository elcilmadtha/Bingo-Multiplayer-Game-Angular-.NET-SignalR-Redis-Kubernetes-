using System.Collections.Concurrent;

namespace bingo_api.Hubs
{
    public class UserConnectionService: IUserConnectionService
    {
        private readonly ConcurrentDictionary<string, string> _userConnections = new();

        public void AddOrUpdate(string username, string connectionId)
        {
            _userConnections[username] = connectionId;
        }

        public bool TryGetConnectionId(string username, out string connectionId)
        {
            return _userConnections.TryGetValue(username, out connectionId);
        }

        public void Remove(string username)
        {
            _userConnections.TryRemove(username, out _);
        }
    }
}
