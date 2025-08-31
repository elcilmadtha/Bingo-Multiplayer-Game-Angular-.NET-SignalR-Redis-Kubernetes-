using bingo_api.BingoGame;
using bingo_api.Redis;
using Microsoft.AspNetCore.SignalR;

namespace bingo_api.Hubs
{
    public class GameMatchService : BackgroundService
    {
        private readonly IRedisService _redisService;
        private readonly IHubContext<GameHub> _hubContext;
        private readonly int DefaultPlayerCount = 2; // in future we can just change this number if game count to be increased to more than 2

        public GameMatchService(IRedisService redisService, IHubContext<GameHub> hubContext)
        {
            _redisService = redisService;
            _hubContext = hubContext;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                long waitingPlayersinQueue = _redisService.GetQueueLength(Constants.QueueName);
                if (waitingPlayersinQueue >= DefaultPlayerCount)
                {
                    var players = new List<(string ConnectionId, string Username)>();

                    for (int i = 0; i < DefaultPlayerCount; i++)
                    {
                        string playerData = _redisService.Dequeue(Constants.QueueName);

                        if (!string.IsNullOrEmpty(playerData))
                        {
                            var parts = playerData.Split('|');
                            if (parts.Length == 2)
                            {
                                players.Add((parts[0], parts[1])); // (connectionId, username)
                            }
                        }
                    }

                    if (players.Count == DefaultPlayerCount)
                    {
                        string sessionId = Guid.NewGuid().ToString();

                        Console.WriteLine($"Creating game session {sessionId} for {DefaultPlayerCount} players.");

                        // Add all players to the group
                        foreach (var player in players)
                        {
                            await _hubContext.Groups.AddToGroupAsync(player.ConnectionId, sessionId);
                        }

                        // Generate boards for all players
                        for (int i = 0; i < players.Count; i++)
                        {
                            var player = players[i];
                            var opponents = players.Where(p => p.ConnectionId != player.ConnectionId).Select(p => p.Username).ToList();
                            var board = GenerateRandomBoxes.GenerateRandomBoard(sessionId, player.Username);
                            board.EnabledToPlay = (i == 0); //make first guy in waiting list as first mover
                            board.Opponents = opponents;
                            await _hubContext.Clients.Client(player.ConnectionId).SendAsync("ReceiveGrid", board);
                        }
                    }
                }
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
