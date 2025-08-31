using bingo_api.Hubs;
using bingo_api.Redis;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.SetMinimumLevel(LogLevel.Debug);
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
         ConnectionMultiplexer.Connect("<your-red-statefulset-url>"));
//instead of redis, if u r usign it in local, u can make use of singleton class in it and
//create a queue there. and all the user request to join the game will go there and u can serve from there.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:51135").AllowAnyHeader().AllowAnyMethod();
    });
});//no authorization is added to this prject. when deployed, anyone can just put there name and start playing.
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<IUserConnectionService, UserConnectionService>();
builder.Services.AddSignalR();
builder.Logging.AddConsole();
builder.Services.AddHostedService<GameMatchService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.MapHub<GameHub>("/gamehub");
//app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Ok("healthy"));
app.Run();
