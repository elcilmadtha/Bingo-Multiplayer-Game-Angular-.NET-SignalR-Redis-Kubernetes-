using bingo_api.Redis;
using Microsoft.AspNetCore.SignalR;

namespace bingo_api.Hubs
{
    public class GameHub: Hub
    {
        private readonly IRedisService _redisService;
        private readonly IUserConnectionService _userConnectionService;
        public GameHub(IRedisService redisService, IUserConnectionService userConnectionService) {
            _redisService = redisService;
            _userConnectionService = userConnectionService;
        }
        public Task<bool> JoinGame(string username)
        {
            _userConnectionService.AddOrUpdate(username, Context.ConnectionId);
            _redisService.Enqueue(Constants.QueueName, $"{Context.ConnectionId}|{username}");
            return Task.FromResult(true);
        }

        public async Task MakeMove(int selectedValue, string username, string sessionId )
        {
            await _redisService.SetAsync($"session:{sessionId}:lastMove", $"{username}|{selectedValue}");
            await Clients.Group(sessionId).SendAsync("ReceiveMove", username, selectedValue);
        }

        public async Task LeaveGame(string sessionId, string username)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            _userConnectionService.Remove(username);
        }

        public async Task GameOver(string username, string sessionId)
        {
            await Clients.Group(sessionId).SendAsync("AnnounceWinner", username);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            _userConnectionService.Remove(username);
        }
    }
}
